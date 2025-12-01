import ChatPage from '@/components/chat/ChatPage';

export default function Page({ params }: { params?: { id?: string[] } }) {
  const id = params?.id?.[0];
  return <ChatPage params={{ id }} />;
}
