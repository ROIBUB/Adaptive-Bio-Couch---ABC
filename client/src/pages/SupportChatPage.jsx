import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supportSocket from '../services/supportSocket';
import { getMyConversation, getAdminsPresence } from '../services/supportService';
import './SupportChatPage.css';

function getUser() {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SupportChatPage() {
    const navigate   = useNavigate();
    const user       = getUser();
    const userId     = user.userId;
    const userRole   = user.userRole;

    const [messages,      setMessages]      = useState([]);
    const [convId,        setConvId]        = useState(null);
    const [adminsOnline,  setAdminsOnline]  = useState(false);
    const [inputText,     setInputText]     = useState('');
    const [isTyping,      setIsTyping]      = useState(false);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState('');
    const [connected,     setConnected]     = useState(false);

    const bottomRef   = useRef(null);
    const typingTimer = useRef(null);

    // Admins/managers have their own Chat Center in AdminPage – redirect them
    useEffect(() => {
        if (userRole === 'admin' || userRole === 'manager') {
            navigate('/admin', { replace: true });
        }
    }, [userRole, navigate]);

    // Load conversation history + admin presence on mount
    useEffect(() => {
        if (!userId) return;
        const load = async () => {
            try {
                const [conv, admins] = await Promise.all([
                    getMyConversation(),
                    getAdminsPresence(),
                ]);
                setMessages(conv?.messages ?? []);
                setConvId(conv?.id ?? null);
                setAdminsOnline(admins.some(a => a.isOnline));
            } catch {
                setError('Could not load conversation. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId]);

    // Socket connection
    useEffect(() => {
        if (!userId) return;

        supportSocket.connect();

        supportSocket.emit('support:join', { userId, role: userRole });

        supportSocket.on('connect', () => setConnected(true));
        supportSocket.on('disconnect', () => setConnected(false));

        supportSocket.on('support:new_message', ({ conversationUserId, message }) => {
            if (Number(conversationUserId) === Number(userId)) {
                setMessages(prev => [...prev, message]);
            }
        });

        supportSocket.on('support:typing', ({ conversationUserId, senderId, isTyping: typing }) => {
            // Show typing indicator only if the typer is NOT the current user
            if (Number(conversationUserId) === Number(userId) && Number(senderId) !== Number(userId)) {
                setIsTyping(typing);
            }
        });

        supportSocket.on('support:presence_update', ({ userId: uid, isOnline }) => {
            // A staff member came online/offline — refresh presence
            getAdminsPresence().then(admins => setAdminsOnline(admins.some(a => a.isOnline))).catch(() => {});
        });

        return () => {
            supportSocket.off('connect');
            supportSocket.off('disconnect');
            supportSocket.off('support:new_message');
            supportSocket.off('support:typing');
            supportSocket.off('support:presence_update');
            supportSocket.disconnect();
        };
    }, [userId, userRole]);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = () => {
        const text = inputText.trim();
        if (!text) return;
        supportSocket.emit('support:message', { conversationUserId: userId, message: text });
        setInputText('');
        // Clear typing indicator
        supportSocket.emit('support:typing', { conversationUserId: userId, isTyping: false });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
            return;
        }
        // Typing indicator
        supportSocket.emit('support:typing', { conversationUserId: userId, isTyping: true });
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
            supportSocket.emit('support:typing', { conversationUserId: userId, isTyping: false });
        }, 1500);
    };

    // Group messages by date for display
    const groupedMessages = messages.reduce((groups, msg) => {
        const key = formatDate(msg.createdAt);
        if (!groups[key]) groups[key] = [];
        groups[key].push(msg);
        return groups;
    }, {});

    if (loading) return <div className="sc-loading">Loading conversation…</div>;

    return (
        <div className="sc-page">
            {/* Header */}
            <div className="sc-header">
                <div className="sc-header-info">
                    <div className="sc-avatar">FW</div>
                    <div>
                        <div className="sc-title">FitWise Support</div>
                        <div className={`sc-status ${adminsOnline ? 'online' : 'offline'}`}>
                            <span className="sc-status-dot" />
                            {adminsOnline ? 'Support team is online': "Support team is offline - we'll reply soon"}
                        </div>
                    </div>
                </div>
                {!connected && <div className="sc-reconnecting">Reconnecting…</div>}
            </div>

            {/* Messages area */}
            <div className="sc-messages">
                {error && <div className="sc-error">{error}</div>}

                {Object.keys(groupedMessages).length === 0 && (
                    <div className="sc-empty">
                        <p>No messages yet. Send us a message and our support team will get back to you!</p>
                    </div>
                )}

                {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                        <div className="sc-date-divider"><span>{date}</span></div>
                        {msgs.map(msg => {
                            const isOwn = Number(msg.senderId) === Number(userId);
                            return (
                                <div key={msg.id} className={`sc-bubble-row ${isOwn ? 'own' : 'other'}`}>
                                    {!isOwn && (
                                        <div className="sc-sender-name">
                                            {msg.senderName || 'Support'} ({msg.senderRole})
                                        </div>
                                    )}
                                    <div className={`sc-bubble ${isOwn ? 'own' : 'other'}`}>
                                        {msg.message}
                                    </div>
                                    <div className="sc-time">{formatTime(msg.createdAt)}</div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {isTyping && (
                    <div className="sc-bubble-row other">
                        <div className="sc-bubble other sc-typing-indicator">
                            <span /><span /><span />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="sc-input-area">
                <textarea
                    className="sc-input"
                    placeholder="Type a message…"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                />
                <button
                    className="sc-send-btn"
                    onClick={sendMessage}
                    disabled={!inputText.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
