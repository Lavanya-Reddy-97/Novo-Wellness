import React from "react";

import { useEffect, useState, useMemo, useCallback } from 'react';

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SearchBar from "@/components/SearchBar";
import { 
  Home, 
  ClipboardList, 
  School, 
  BookOpen, 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  Users, 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Heart, 
  ShieldCheck, 
  Brain, 
  Gamepad2,
  ChevronDown, 
  ChevronRight, 
  ChevronUp, 
  AlertTriangle, 
  MessageSquareWarning, 
  MessageSquare, 
  BellRing 
} from "lucide-react";
import { useAuthFirebase } from "@/hooks/useAuthFirebase";

import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  subItems?: { name: string; path: string; icon?: React.ComponentType<{ className?: string }> }[];
}

const NavItem = ({ 
  item, 
  isActive, 
  isMobile = false,
  onNavigate 
}: { 
  item: MenuItemProps; 
  isActive: boolean; 
  isMobile?: boolean;
  onNavigate?: (e: React.MouseEvent) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const Icon = item.icon;

  const content = (
    <div className={cn(
      "flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-md group",
      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
      isMobile ? "py-3" : "py-2"
    )}>
      <div className="flex items-center">
        <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-primary" : "")} />
        <span>{item.name}</span>
      </div>
      
      {item.badge && item.badge > 0 && (
        <Badge variant="destructive" className="ml-2">
          {item.badge}
        </Badge>
      )}
      
      {hasSubItems && (
        <ChevronDown className={cn(
          "w-4 h-4 ml-2 transition-transform duration-200",
          isOpen ? "transform rotate-180" : ""
        )} />
      )}
    </div>
  );

  const handleClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      onNavigate(e);
    }
    
    // Close the mobile menu if open
    const mobileMenu = document.querySelector('[data-state="open"]');
    if (mobileMenu && isMobile) {
      (mobileMenu as HTMLElement).click();
    }
  };

  if (hasSubItems) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild className="w-full">
          <div>
            {content}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 mt-1 space-y-1">
          {item.subItems?.map((subItem) => (
            <Link
              key={subItem.path}
              to={subItem.path}
              className={cn(
                "flex items-center px-4 py-2 text-sm rounded-md",
                isActive ? "bg-accent/50" : "text-muted-foreground hover:bg-accent/30"
              )}
              onClick={handleClick}
            >
              {subItem.icon && (
                <subItem.icon className="w-4 h-4 mr-2" />
              )}
              {subItem.name}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link 
      to={item.path} 
      className="block" 
      onClick={(e) => {
        if (onNavigate) {
          onNavigate(e);
        }
        
        // Close the mobile menu if open
        const mobileMenu = document.querySelector('[data-state="open"]');
        if (mobileMenu && isMobile) {
          (mobileMenu as HTMLElement).click();
        }
      }}
    >
      {content}
    </Link>
  );
};

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthFirebase();
  const { toast } = useToast();
  
  // Get user role from auth
  const userRole = user?.role || 'student'; // Default to student view if no role
  
  // Memoize role checks
  const { isManagement, isStudent } = useMemo(() => ({
    isManagement: userRole === 'management',
    isStudent: userRole === 'student' || !userRole
  }), [userRole]);

  // Header section items (role-based)
  const headerNavItems = useMemo(() => {
    const commonItems = [
      { name: "Home", path: "/", icon: Home },
      { name: "Wellness", path: "/wellness-dashboard", icon: Heart },
      { name: "Cognitive Tasks", path: "/cognitive-tasks", icon: Gamepad2 },
      { name: "Resources", path: "/resources", icon: BookOpen },
      { name: "BuddySafe", path: "/buddysafe", icon: ShieldCheck },
    ];
    
    if (isManagement) {
      return [
        { name: "Dashboard", path: "/school-dashboard", icon: School },
        ...commonItems.filter(item => item.name !== "Wellness" && item.name !== "Cognitive Tasks"),
      ];
    }
    
    return commonItems;
  }, [isManagement]);
  
  // Handle navigation with proper role checking
  const handleNavigation = (e: React.MouseEvent, path: string) => {
    // For protected routes, ensure user has the right role
    if (path.startsWith('/school-dashboard') && userRole !== 'management') {
      e.preventDefault();
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      return;
    }
    
    // Don't prevent default for normal navigation
    // This allows the Link component to handle the navigation
  };

  // Memoize nav items to prevent unnecessary re-renders
  const navItems = useMemo(() => {
    const commonItems = [
      { name: "Home", path: "/", icon: Home },
      { name: "Wellness", path: "/wellness-dashboard", icon: Heart },
      { name: "Cognitive Tasks", path: "/cognitive-tasks", icon: Gamepad2 },
      { name: "Resources", path: "/resources", icon: BookOpen },
      { name: "BuddySafe", path: "/buddysafe", icon: ShieldCheck },
    ];
    
    if (userRole === 'management') {
      return [
        { name: "Dashboard", path: "/school-dashboard", icon: School },
        ...commonItems.filter(item => item.name !== "Wellness" && item.name !== "Cognitive Tasks"),
      ];
    }
    
    return commonItems;
  }, [userRole]);

  // Function to check if a nav item is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const studentMenuItems = [
    { name: "My Dashboard", path: "/student-dashboard", icon: BarChart3 },
    { name: "Progress Tracking", path: "/progress-tracking", icon: TrendingUp },
    { name: "My Assessments", path: "/my-assessments", icon: ClipboardList },
    { name: "BuddySafe", path: "/buddysafe", icon: ShieldCheck },
    { name: "Profile Settings", path: "/profile-settings", icon: Settings },
  ];

  const managementMenuItems = [
    { name: "School Dashboard", path: "/school-dashboard", icon: School },
    { name: "BuddySafe", path: "/buddysafe", icon: ShieldCheck },
    { name: "Reports", path: "/reports", icon: FileText },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { 
      name: "Alerts & Notifications", 
      path: "/alerts", 
      icon: Bell,
      badge: 3, // Example count of unread alerts
      subItems: [
        { 
          name: "High Risk Alerts", 
          path: "/alerts/high-risk",
          icon: AlertTriangle
        },
        { 
          name: "Intervention Updates", 
          path: "/alerts/interventions",
          icon: MessageSquareWarning
        },
        { 
          name: "System Notifications", 
          path: "/alerts/system",
          icon: BellRing
        },
      ]
    },
    { name: "School Settings", path: "/school-settings", icon: Settings },
  ];

  const handleLogout = async () => {
  try {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
      duration: 2000,
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to log out. Please try again.",
      variant: "destructive",
      duration: 2000,
    });
  }
};

  // Memoize user data to prevent unnecessary re-renders
  const userInitials = useMemo(() => {
  if (user?.displayName) {
    return user.displayName.charAt(0).toUpperCase();
  }
  if (user?.email) {
    return user.email.charAt(0).toUpperCase();
  }
  return "U";
}, [user?.displayName, user?.email]);

  const userName = useMemo(() => {
    return user?.demographics?.name || user?.displayName || user?.email || "User";
  }, [user?.demographics?.name, user?.displayName, user?.email]);

  // Skip rendering navigation on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center flex-shrink-0">
            <Link to="/">
              <img src="/logo.png" alt="Novo Wellness Logo" className="h-10 w-auto object-contain cursor-pointer" />
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-2 ml-4">
            {headerNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-base font-medium rounded-md ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${active ? 'text-blue-600' : ''}`} />
                  <span className={active ? 'font-semibold' : ''}>{item.name}</span>
                </Link>
              );
            })}
          </div>
          {/* Mobile menu */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Mobile menu button */}
            <button
              className="p-2 rounded-md text-teal-600 hover:bg-gray-100 md:hidden focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              type="button"
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${mobileMenuOpen ? 'transform rotate-90' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            <div className="flex items-center">
              <SearchBar />
              {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full cursor-pointer p-0"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="Profile" />
                      <AvatarFallback 
                        className="bg-teal-500 text-white cursor-pointer select-none"
                        suppressHydrationWarning
                      >
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-white border shadow-lg z-50 [&>*]:cursor-pointer" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">{userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {isManagement ? "School Management" : isStudent ? "Student" : "User"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {isManagement ? (
                    <>
                      {managementMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem key={item.path} asChild>
                            <Link to={item.path} className="flex items-center space-x-2 w-full">
                              <Icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {studentMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem key={item.path} asChild>
                            <Link to={item.path} className="flex items-center space-x-2 w-full">
                              <Icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="outline"
                  size="sm" 
                  className="border-teal-500 text-teal-600 hover:bg-teal-50 hover:text-teal-700 h-8 px-3"
                >
                  <User className="w-4 h-4 mr-1" />
                  <span className="text-sm">Login</span>
                </Button>
              </Link>
            )}
          </div>
          </div>
          
          {/* Mobile dropdown menu */}
          <div
            className={`fixed inset-0 z-50 bg-white transition-all duration-300 ease-in-out transform ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{
              display: mobileMenuOpen ? 'block' : 'none',
              paddingTop: '5rem', // Space for the header
              overflowY: 'auto',
            }}
            data-state={mobileMenuOpen ? 'open' : 'closed'}
          >
            <div className="flex flex-col space-y-1 p-4">
              {navItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isActive(item.path)}
                  isMobile={true}
                  onNavigate={(e) => {
                    handleNavigation(e, item.path);
                    setMobileMenuOpen(false);
                  }}
                />
              ))}
            </div>
            
            {/* User profile section in mobile menu */}
            {user && (
              <div className="mt-4 border-t border-gray-200 pt-4 px-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                    {userInitials}
                  </div>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-sm text-gray-500">
                      {isManagement ? 'School Management' : isStudent ? 'Student' : 'User'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
