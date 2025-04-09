"use client";

import React, { useEffect, useState } from "react";
import {
  Home,
  MapPin,
  Wallet,
  Bell,
  Bot,
  BarChart3,
  Settings,
  User,
  ChevronRight,
  Banknote 
} from "lucide-react";

import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";

const data = {
  teams: [
    {
      name: "Personal",
      logo: User,
      plan: "Free",
    },
    {
      name: "Work",
      logo: User,
      plan: "Premium",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Tracker",
      url: "#",
      icon: MapPin,
      items: [
        { title: "Trips", url: "/track/trips" },
        { title: "Hangouts", url: "/track/hangouts" },
      ],
    },
    {
      title: "Finance",
      url: "#",
      icon: Banknote,
      items: [
        { title: "Salary", url: "/finance/salary" },
        { title: "Expenses", url: "/finance/expenses" },
        { title: "Investments", url: "/finance/investments" },
      ],
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Smart Assistant - Neo",
      url: "/neo",
      icon: Bot,
    },
    {
      title: "Reports & Analytics",
      url: "#",
      icon: BarChart3,
      items: [
        { title: "Expense Reports", url: "/report/expense" },
        { title: "Budgeting", url: "/report/budget" },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        { title: "Preferences", url: "/preferences" },
        { title: "Account", url: "/account" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
