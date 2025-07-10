
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { transcribeAudio, generateSessionSummary } from '@/services/geminiService';

type SessionRecorderProps = {
  onTranscript: (transcript: string) => void;
  onSummary?: (summary: SessionSummary) => void;
  className?: string;
};

type SessionSummary = {
  focusArea: string;
  keyPoints: string[];
  actionPlan: string[];
};

export function SessionRecorder({ onTranscript, onSummary, className }: SessionRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to process audio using Gemini API
  const processAudioToText = async (audioBlob: Blob, isLiveRecording: boolean = false): Promise<string> => {
    try {
      setTranscript('Transcribing audio...');
      const text = await transcribeAudio(audioBlob);
      return text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio. Please try again.');
    }
  };

  // Function to generate a summary using Gemini API
  const generateSummary = async (transcript: string): Promise<SessionSummary> => {
    try {
      setTranscript(prev => prev + '\n\nGenerating summary...');
      const summary = await generateSessionSummary(transcript);
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      // Fallback to a basic summary if AI generation fails
      return {
        focusArea: "General Counseling Session",
        keyPoints: [
          "Discussed current challenges and concerns",
          "Explored emotional state and stress levels",
          "Identified potential coping strategies"
        ],
        actionPlan: [
          "Practice deep breathing exercises for 5 minutes daily",
          "Keep a journal of thoughts and feelings",
          "Schedule a follow-up session"
        ]
      };
    }
  };


  const checkMicrophonePermission = async (): Promise<MediaStream> => {
    // Check if the browser supports mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isSecure = window.location.protocol === 'https:' || isLocalhost;
      
      if (!isSecure) {
        throw new Error('Microphone access requires a secure context (HTTPS). Please use HTTPS or localhost.');
      } else {
        throw new Error('Your browser does not support microphone access or the MediaDevices API is not available.');
      }
    }

    try {
      // Request microphone access with simplified constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      };
      
      // This will trigger the browser's permission prompt
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Check if we actually got an audio track
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        // Clean up if no audio tracks were granted
        stream.getTracks().forEach(track => track.stop());
        throw new Error('No audio recording device found or access was denied.');
      }
      
      return stream;
    } catch (error) {
      console.error('Microphone access error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          throw new Error('Microphone access was denied. Please allow microphone access to record audio.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          throw new Error('No microphone was found. Please ensure a microphone is connected and try again.');
        } else if (error.name === 'NotReadableError') {
          throw new Error('Could not access the microphone. It might be in use by another application.');
        } else if (error.name === 'OverconstrainedError') {
          throw new Error('The requested audio settings are not supported by your device.');
        }
      }
      
      throw new Error('Unable to access microphone. Please check your browser settings.');
    }
  };

  const startRecording = async () => {
    // Reset previous states
    setError(null);
    setTranscript('');
    setIsProcessing(true);
    
    try {
      setTranscript('Requesting microphone access...');
      
      // This will trigger the browser's permission prompt
      const stream = await checkMicrophonePermission();
      
      // If we get here, permission was granted
      audioChunksRef.current = [];
      
      // Configure media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          if (audioChunksRef.current.length === 0) {
            throw new Error('No audio was recorded. Please try speaking louder or check your microphone.');
          }
          
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm;codecs=opus' 
          });
          
          // Create a URL for the audio blob
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          
          // Process the audio with Gemini API
          setTranscript('Processing your recording...');
          
          try {
            const text = await processAudioToText(audioBlob, true);
            setTranscript(text);
            onTranscript?.(text);
            
            // Only generate summary if we have enough text
            if (text.trim().split(/\s+/).length > 5) { // At least 5 words
              const summary = await generateSummary(text);
              onSummary?.(summary);
            } else {
              console.warn('Transcript too short for summary generation');
              onSummary?.({
                focusArea: 'Brief Recording',
                keyPoints: ['The recording was too short to generate a detailed summary.'],
                actionPlan: ['Consider recording a longer session for better analysis.']
              });
            }
            
          } catch (processingError) {
            console.error('Error in audio processing:', processingError);
            throw new Error('Failed to process the audio. The recording might be too short or unclear.');
          }
          
        } catch (err) {
          const error = err as Error;
          console.error('Recording processing error:', error);
          
          // More specific error messages
          let errorMessage = 'Failed to process recording. ';
          
          if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
            errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings.';
          } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMessage = 'No microphone was found. Please ensure a microphone is connected and try again.';
          } else if (error.name === 'NotReadableError') {
            errorMessage = 'Microphone is already in use by another application. Please close other applications using the microphone.';
          } else if (error.message.includes('too short') || error.message.includes('no speech')) {
            errorMessage = 'The recording was too short or no speech was detected. Please try again with a longer recording.';
          } else {
            errorMessage += error.message || 'Please try again.';
          }
          
          setError(errorMessage);
          
          // If we have a transcript but summary failed, still show the transcript
          if (transcript && !transcript.includes('Processing')) {
            onTranscript?.(transcript);
          }
        } finally {
          setIsProcessing(false);
        }
      };
      
      mediaRecorder.start(1000); // Get data every second
      setIsRecording(true);
      setTranscript('Listening... Speak now.');
      
    } catch (err) {
      setError('Could not access microphone. Please ensure you have granted microphone permissions.');
      console.error('Error accessing microphone:', err);
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        // Stop the media recorder first
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        
        // Stop all tracks in the stream
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => {
            track.stop();
          });
        }
        
        setIsRecording(false);
        setTranscript(prev => prev || 'Processing completed.');
      } catch (error) {
        console.error('Error stopping recording:', error);
        setError('Error stopping the recording. Please try again.');
      }
    }
  };

  const processAudioWithWhisper = async (audioBlob: Blob): Promise<string> => {
    try {
      setTranscript('Transcribing audio...');
      const text = await transcribeAudio(audioBlob);
      return text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio. Please try again.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mpeg'];
    if (!validTypes.some(type => file.type.includes(type.replace('audio/', '')))) {
      setError('Please upload a valid audio file (MP3, WAV, WebM, or OGG)');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setTranscript('Processing audio file...');
    
    try {
      const audioBlob = new Blob([file], { type: file.type });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      
      // Process the audio with Gemini API
      const text = await processAudioWithWhisper(audioBlob);
      setTranscript(text);
      onTranscript?.(text);
      
      // Generate and set summary using Gemini
      const summary = await generateSummary(text);
      onSummary?.(summary);
      
    } catch (err) {
      const error = err as Error;
      setError(`Failed to process audio file: ${error.message}`);
      console.error('Error processing audio file:', error);
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Clean up function to stop all media tracks and clean up resources
  const cleanupMedia = useCallback(() => {
    // Stop media recorder if active
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        // Stop all tracks in the stream
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => {
            track.stop();
          });
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
    
    // Clean up audio URL if it exists
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);
  
  // Set up cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, [cleanupMedia]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "default"}
          className="flex items-center gap-2 flex-1 justify-center min-w-0"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isRecording ? (
            <>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Start Recording
            </>
          )}
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".mp3,.wav,.webm,.ogg,.m4a"
          className="hidden"
          disabled={isProcessing}
        />
        <Button
          variant="outline"
          className="flex items-center gap-2 flex-1 justify-center min-w-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Audio
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-50 rounded-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isProcessing && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-foreground">
                {transcript.includes('Generating summary') ? 'Generating Summary' : 'Transcribing Audio'}
              </p>
              <p className="text-sm text-muted-foreground">
                {transcript.includes('Generating summary') 
                  ? 'Analyzing the conversation...' 
                  : 'This may take a moment...'}
              </p>
            </div>
          </div>
          <div className="mt-4 w-full max-w-xs bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ 
                width: transcript.includes('Generating summary') ? '90%' : '60%',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Uploaded Audio</h3>
          <audio 
            src={audioUrl} 
            controls 
            className="w-full rounded-lg border"
          />
        </div>
      )}

      {transcript && !isProcessing && (
        <div className="mt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Session Transcript</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Transcription complete</span>
              </div>
            </div>
            <div className="p-4 bg-muted/30 border rounded-md whitespace-pre-wrap font-sans text-sm leading-relaxed max-h-80 overflow-y-auto">
              {transcript.split('\n').map((line, i) => {
                if (line.match(/^\w+:/)) {
                  // Style speaker names differently
                  const [speaker, ...text] = line.split(':');
                  return (
                    <div key={i} className="mb-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{speaker}:</span>
                      <span className="ml-1">{text.join(':')}</span>
                    </div>
                  );
                }
                return line.trim() ? (
                  <div key={i} className="mb-3 text-muted-foreground">
                    {line}
                  </div>
                ) : null;
              })}
            </div>
            <div className="text-xs text-muted-foreground text-right">
              Transcript generated with AI
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
