import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientUsersPage from "./ClientUsersPage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


interface PageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    dir?: string;
    page?: string;
  }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  // Hanya Admin yang bisa melihat manajemen user
  if (currentUser.role !== "Admin") {
    redirect("/");
  }

  const params = await searchParams;
  const search = params.search || "";
  const sort = params.sort || "createdAt";
  const dir = params.dir || "desc";
  const page = parseInt(params.page || "1", 10);
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build filter
  const whereClause = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { role: { contains: search } },
        ],
      }
    : {};

  // Build sorting
  const allowedSortKeys = ["name", "email", "role", "createdAt"];
  const orderByField = allowedSortKeys.includes(sort) ? sort : "createdAt";
  const orderDir = dir === "asc" ? "asc" : "desc";

  // Tarik data dengan pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      orderBy: { [orderByField]: orderDir },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <ClientUsersPage 
      users={users} 
      currentUser={currentUser} 
      totalCount={total} 
      totalPages={totalPages} 
      currentPage={page} 
    />
  );
}
