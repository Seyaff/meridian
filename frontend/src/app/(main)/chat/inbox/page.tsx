interface Props {
  params: {
    id?: string;
  };
}

export default async function InboxPage({ params }: Props) {
  const id = params?.id;

  // No conversation selected
  if (!id) {
    return (
      <main className="flex h-screen w-full items-center justify-center ">
        <div className="text-center">
          <h1 className="text-2xl font-semibold ">
            No Conversation Selected
          </h1>

          <p className="mt-2 text-zinc-400">
            Please select a conversation to start chatting.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      inbox page - {id}
    </main>
  );
}