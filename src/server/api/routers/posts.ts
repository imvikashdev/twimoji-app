import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "y/server/api/trpc";
import clerkClient from "@clerk/clerk-sdk-node";
import type { User } from "@clerk/clerk-sdk-node";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.prisma.post.findMany({
      take: 100,
    });
    const users = (
      await clerkClient.users.getUserList({
        userId: post.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);
    console.log(users);

    return post.map((post) => ({
      post,
      author: users.find((user) => user.id === post.authorId),
    }));
  }),
});
