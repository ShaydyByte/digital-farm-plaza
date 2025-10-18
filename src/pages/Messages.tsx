import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
}

interface CropInfo {
  id: string;
  crop_name: string;
  farmer_id: string;
  farmer_name: string;
}

const Messages = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const cropId = searchParams.get('crop');
  const farmerId = searchParams.get('farmer');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [cropInfo, setCropInfo] = useState<CropInfo | null>(null);

  useEffect(() => {
    if (!loading && !profile) {
      navigate('/login');
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (profile && farmerId) {
      fetchMessages();
      fetchCropInfo();

      // Subscribe to realtime messages
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (
              (newMsg.sender_id === profile.id && newMsg.receiver_id === farmerId) ||
              (newMsg.sender_id === farmerId && newMsg.receiver_id === profile.id)
            ) {
              setMessages((prev) => [...prev, newMsg]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile, farmerId]);

  const fetchCropInfo = async () => {
    if (!cropId) return;

    const { data } = await supabase
      .from('crops')
      .select(`
        id,
        crop_name,
        farmer_id,
        profiles!crops_farmer_id_fkey(full_name)
      `)
      .eq('id', cropId)
      .single();

    if (data) {
      setCropInfo({
        ...data,
        farmer_name: (data.profiles as any)?.full_name || 'Unknown',
      });
    }
  };

  const fetchMessages = async () => {
    if (!profile || !farmerId) return;

    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name)
      `)
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${farmerId}),and(sender_id.eq.${farmerId},receiver_id.eq.${profile.id})`)
      .order('created_at', { ascending: true });

    if (data) {
      const messagesWithNames = data.map((msg: any) => ({
        ...msg,
        sender_name: msg.sender?.full_name || 'Unknown',
      }));
      setMessages(messagesWithNames);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', profile.id)
        .eq('sender_id', farmerId);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile || !farmerId) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: profile.id,
        receiver_id: farmerId,
        crop_id: cropId,
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {cropInfo ? `Messages about ${cropInfo.crop_name}` : 'Messages'}
            </CardTitle>
            <CardDescription>
              {cropInfo && `Chat with ${cropInfo.farmer_name}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === profile.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender_id === profile.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1">
                          {msg.sender_id === profile.id ? 'You' : msg.sender_name}
                        </p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
              />
              <Button type="submit" disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
