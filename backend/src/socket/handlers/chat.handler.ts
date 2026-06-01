import { Server, Socket } from "socket.io";
import { messageService } from "../../services/message.service";
import z from "zod";
import { getActiveParticipant } from "../../services/membership.service";
import { typingStore } from "../../utils/typing.util";
import { conversationService } from "../../services/conversation.service";

const joinSchema = z.object({ conversationId: z.string().regex(/^[a-fA-F0-9]{24}$/) });

const mediaSchema = z.object({
  url: z.string().url(),
  mimeType: z.string().min(1),
  filename: z.string().min(1),
  size: z.number().positive(),
  duration: z.number().positive().optional(),
});

const sendSchema = z
  .object({
    conversationId: z.string().regex(/^[a-fA-F0-9]{24}$/),
    content: z.string().trim().max(4000).optional(),
    type: z.enum(["text", "image", "file", "voice"]).optional(),
    media: mediaSchema.optional(),
    replyToId: z.string().regex(/^[a-fA-F0-9]{24}$/).optional(),
    clientId: z.string().max(64).optional(),
  })
  .refine(
    (data) => {
      const type = data.type ?? "text";
      if (type === "text") return (data.content ?? "").trim().length > 0;
      return !!data.media;
    },
    { message: "Invalid message payload" },
  );

const typingSchema = z.object({
  conversationId: z.string().regex(/^[a-fA-F0-9]{24}$/),
});

const readSchema = z.object({
  conversationId: z.string().regex(/^[a-fA-F0-9]{24}$/),
});

function roomId(conversationId: string) {
  return `conversation:${conversationId}`;
}

export type AuthedSocket = Socket & {
  userId: string;
  userRole: string;
};

export const chatHandlers = (io: Server) => {

  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthedSocket
    console.log("Socket connected " , socket.id)
    console.log("User Id :" , socket.userId)
    console.log("User role :" , socket.userRole)


    socket.on("conversation:join" , async (payload , ack) => {
      try {
        const {conversationId} = joinSchema.parse(payload) 
        await getActiveParticipant(conversationId, socket.userId);
        await socket.join(roomId(conversationId));
        ack?.({ success: true, conversationId });
        console.log("Room joined" , socket.rooms)

      }catch(err) {
        ack?.({ success: false, message: err instanceof Error ? err.message : "Join failed" });
      }
    } )


       socket.on("conversation:leave", async (payload) => {
      try {
        const { conversationId } = joinSchema.parse(payload);
        await socket.leave(roomId(conversationId));
        typingStore.clearTyping(conversationId, socket.userId);
      } catch {
        /* ignore */
      }
    });
  
    socket.on("message:send", async (payload, ack) => {
      try {
        const data = sendSchema.parse(payload);
        const message = await messageService.send(data.conversationId, socket.userId, {
          content: data.content,
          type: data.type,
          media: data.media,
          replyToId: data.replyToId,
          clientId: data.clientId,
        });

        io.to(roomId(data.conversationId)).emit("message:new", { message });
       

        ack?.({ success: true, message });
      } catch (err) {
        ack?.({ success: false, message: err instanceof Error ? err.message : "Send failed" });
      }
    });

       socket.on("typing:start", (payload) => {
      try {
        const { conversationId } = typingSchema.parse(payload);
        const userIds = typingStore.setTyping(conversationId, socket.userId);
        socket.to(roomId(conversationId)).emit("typing:update", {
          conversationId,
          userIds: userIds.filter((id) => id !== socket.userId),
        });
      } catch {
        /* ignore */
      }
    });

    socket.on("typing:stop", (payload) => {
      try {
        const { conversationId } = typingSchema.parse(payload);
        const userIds = typingStore.clearTyping(conversationId, socket.userId);
        socket.to(roomId(conversationId)).emit("typing:update", {
          conversationId,
          userIds,
        });
      } catch {
        /* ignore */
      }
    });

    socket.on("message:read", async (payload) => {
      try {
        const { conversationId } = readSchema.parse(payload);
        const result = await conversationService.markRead(conversationId, socket.userId);
        socket.to(roomId(conversationId)).emit("message:read", {
          conversationId,
          userId: socket.userId,
          lastReadAt: result.lastReadAt,
        });
      } catch {
        /* ignore */
      }
    });

    

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  });
};
