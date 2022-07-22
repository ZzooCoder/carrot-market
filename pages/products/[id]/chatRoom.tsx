import { ChatRoom, PrivateChat, User } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import useMutation from "../../../libs/client/useMutation";
import useUser from "../../../libs/client/useUser";
import Layout from "../../components/layout";
import UserMessage from "../../components/message";

interface ChatForm {
  chat: string;
}
interface CreateChatResponse {
  ok: boolean;
  newChat: PrivateChat;
}

interface PrivateChatWithUser extends PrivateChat {
  user: User;
}
interface ChatRoomDetail extends ChatRoom {
  PrivateChats: PrivateChatWithUser[];
}
interface ChatRoomResponse {
  ok: boolean;
  chatRoom: ChatRoomDetail;
}
const PrivateChat: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { register, handleSubmit, reset } = useForm<ChatForm>();
  const [createMessage, { data: newChat, loading: newChatLoading }] =
    useMutation<CreateChatResponse>(
      `/api/products/${router.query.id}/chatRoom`
    );
  const { data, mutate } = useSWR<ChatRoomResponse>(
    router.query.id ? `/api/products/${router.query.id}/chatRoom` : null
  );
  const [popup, setPopup] = useState(false);

  const confirm = async (event: React.FormEvent) => {
    const tradeData = await fetch(`/api/product/${router.query.id}/trade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    if (tradeData && tradeData.ok) {
      router.push("/");
    }
    setPopup(false);
  };

  const onValid = (form: ChatForm) => {
    if (newChatLoading) return;
    reset();
    if (data) {
      mutate(
        (prev) =>
          prev &&
          ({
            ...prev,
            chatRoom: {
              ...data?.chatRoom,
              PrivateChats: [
                ...data?.chatRoom?.PrivateChats,
                {
                  chat: form.chat,
                  user: { avatar: user?.avatar, id: user?.id },
                },
              ],
            },
          } as any),
        false
      );
    }
    createMessage(form);
  };

  return (
    <Layout title="Private Chat" canGoBack>
      <div className="relative h-max w-full">
        <h2 className="text-2xl font-bold text-gray-900 mt-16">
          Talk to each ather
        </h2>
        <div className="py-10 pb-16 h-[75vh] overflow-y-auto  px-4 space-y-4 mt-3 border rounded-md">
          {data?.chatRoom.PrivateChats.map((chat) => (
            <UserMessage
              key={chat.id}
              message={chat.chat}
              reversed={chat.user.id === user?.id}
              imgId={chat.user.avatar!}
            ></UserMessage>
          ))}
        </div>
        <div className="w-full max-w-md mx-auto inset-x-0 -mt-10">
          <form onSubmit={handleSubmit(onValid)} className="relative">
            <input
              {...register("chat")}
              type="text"
              className="w-full border rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-none px-3 py-1 text-sm shadow-sm"
            />
            <button className="absolute inset-y-0 my-auto right-1 h-6 aspect-square bg-orange-500 rounded-full text-center leading-[22px] text-white font-semibold -rotate-90 cursor-pointer hover:scale-105 hover:bg-orange-600">
              <span>&rarr;</span>
            </button>
          </form>
        </div>
      </div>
      <span
        onClick={() => {
          setPopup(true);
        }}
        className="w-full block py-3 bg-orange-500 rounded-md text-center leading-[22px] text-white font-semibold  cursor-pointer hover:bg-orange-600 mt-5"
      >
        구매확정
      </span>
      {popup ? (
        <form
          onSubmit={confirm}
          className="absolute inset-0 m-auto h-max bg-slate-100 w-2/3 border flex flex-col justify-center items-center py-4 rounded-sm"
        >
          <span>구매를 확정지으시겠습니까?</span>
          <div className="flex justify-center items-center w-full mt-5">
            <button className="bg-orange-400 text-white w-20 rounded-sm hover:bg-orange-500">
              네
            </button>
            <div
              onClick={() => setPopup(false)}
              className="cursor-pointer ml-5 rounded-sm border border-slate-300 bg-white w-20 text-center"
            >
              아니요
            </div>
          </div>
        </form>
      ) : null}
    </Layout>
  );
};

export default PrivateChat;
