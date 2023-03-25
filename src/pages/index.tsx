import { useSocketClient } from '@/lib/socket/client';
import { useEffect, useRef, useState } from 'react';
import styles from './index.styles.module.css';
const IndexPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [socket] = useSocketClient();
  const handleSend = () => {
    if (!socket) return;
    socket.emit('send-msg', { msg: message });
    setMessage('');
  };

  const count = useRef(0);
  useEffect(() => {
    console.log('i am running how many times ', count.current++);
    if (socket) {
      if (socket.disconnected) {
        socket.connect();
      }
      socket.on('connect', () => {
        console.log('connected');
      });
      const handler = (data: { msg: string }) => {
        setMessages(prev => [...prev, data.msg]);
      };
      socket.on('receive-msg', handler);
      return () => {
        socket.off('receive-msg', handler);
        socket.off('connect');
        if (socket.connected) {
          socket.disconnect();
        }
      };
    }
  }, [socket]);
  return (
    <div>
      <input
        type='text'
        value={message}
        onChange={evt => setMessage(evt.target.value)}
      />
      <button onClick={handleSend}>send</button>
      <div className={styles.chatWrapper}>
        {messages.map((msg, idx) => {
          return (
            <p key={idx} className={styles.chatBox}>
              {idx + 1} : {msg}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default IndexPage;

