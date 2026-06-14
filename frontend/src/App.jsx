import { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import api, { setAuthToken, streamChat } from "./api/api";

import Spinner from "./components/Spinner";
import LoginScreen from "./components/LoginScreen";
import Header from "./components/Header";
import EmptyState from "./components/EmptyState";
import Message from "./components/Message";
import ThinkingIndicator from "./components/ThinkingIndicator";
import ChatInput from "./components/ChatInput";
import CompareBar from "./components/CompareBar";
import CompareModal from "./components/CompareModal";
import { carKey } from "./utils/carHelpers";

export default function App() {
  const {
    isLoading,
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  const [selectedCars, setSelectedCars] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const inputRef = useRef(null);

  // NEW
  const messagesContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  // Auto-scroll only when a new message is added
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    if (shouldAutoScrollRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, loading]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const threshold = 100;

    shouldAutoScrollRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const init = async () => {
      setSessionLoading(true);

      try {
        const token = await getAccessTokenSilently();
        setAuthToken(token);

        const { data } = await api.get("/session");

        if (data.messages && data.messages.length > 0) {
          const uiMessages = data.messages.map((m) =>
            m.role === "user"
              ? { role: "user", content: m.content }
              : {
                  role: "assistant",
                  recommendation: m.content,
                  cars: m.cars || [],
                }
          );

          setMessages(uiMessages);
          setStarted(true);
        }
      } catch (err) {
        console.error("Session load error:", err);
      } finally {
        setSessionLoading(false);
      }
    };

    init();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) return <Spinner />;
  if (!isAuthenticated)
    return <LoginScreen onLogin={() => loginWithRedirect()} />;
  if (sessionLoading) return <Spinner />;

  const send = async (query) => {
    const q = (query || input).trim();

    if (!q || loading || streaming) return;

    try {
      const token = await getAccessTokenSilently();
      setAuthToken(token);
    } catch (err) {
      console.error("Token refresh failed:", err);
    }

    setStarted(true);
    setInput("");

    const history = messages.map((m) => ({
      role: m.role,
      content:
        m.role === "assistant" ? m.recommendation : m.content,
    }));

    setMessages((prev) => [
      ...prev,
      { role: "user", content: q },
    ]);

    setLoading(true);

    let assistantIndex = -1;

    try {
      await streamChat(q, history, {
        onCars: (cars) => {
          setLoading(false);
          setStreaming(true);

          setMessages((prev) => {
            assistantIndex = prev.length;

            return [
              ...prev,
              {
                role: "assistant",
                recommendation: "",
                cars,
              },
            ];
          });
        },

        onToken: (token) => {
          setMessages((prev) => {
            if (assistantIndex === -1) return prev;

            const next = [...prev];

            next[assistantIndex] = {
              ...next[assistantIndex],
              recommendation:
                next[assistantIndex].recommendation + token,
            };

            return next;
          });

          requestAnimationFrame(() => {
            const el = messagesContainerRef.current;

            if (el && shouldAutoScrollRef.current) {
              el.scrollTop = el.scrollHeight;
            }
          });
        },

        onDone: () => {
          setStreaming(false);
          setLoading(false);

          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        },

        onError: (message) => {
          setLoading(false);
          setStreaming(false);

          setMessages((prev) => {
            if (assistantIndex !== -1) {
              const next = [...prev];

              next[assistantIndex] = {
                ...next[assistantIndex],
                recommendation:
                  message ||
                  "Could not connect to server. Please try again.",
              };

              return next;
            }

            return [
              ...prev,
              {
                role: "assistant",
                recommendation:
                  "Could not connect to server. Please try again.",
                cars: [],
              },
            ];
          });

          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        },
      });
    } catch {
      setLoading(false);
      setStreaming(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          recommendation:
            "Could not connect to server. Please try again.",
          cars: [],
        },
      ]);
    }
  };

  const reset = async () => {
    try {
      await api.delete("/session");
    } catch (err) {
      console.error("Clear session error:", err);
    }

    setMessages([]);
    setStarted(false);
    setInput("");
    setSelectedCars([]);
    setShowCompare(false);
  };

  const toggleCompare = (car) => {
    setSelectedCars((prev) => {
      const exists = prev.some(
        (c) => carKey(c) === carKey(car)
      );

      if (exists) {
        return prev.filter(
          (c) => carKey(c) !== carKey(car)
        );
      }

      if (prev.length >= 2) return prev;

      return [...prev, car];
    });
  };

  const removeFromCompare = (car) => {
    setSelectedCars((prev) =>
      prev.filter((c) => carKey(c) !== carKey(car))
    );
  };

  const clearCompare = () => setSelectedCars([]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Header
        started={started}
        onReset={reset}
        user={user}
        onLogout={() =>
          logout({
            logoutParams: {
              returnTo: window.location.origin,
            },
          })
        }
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {!started && (
          <EmptyState onSuggestionClick={send} />
        )}

        {started && (
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-5 py-6"
          >
            {messages.map((msg, i) => (
              <Message
                key={i}
                msg={msg}
                selectedCars={selectedCars}
                onToggleCompare={toggleCompare}
                isStreaming={
                  streaming &&
                  i === messages.length - 1 &&
                  msg.role === "assistant"
                }
              />
            ))}

            {loading && <ThinkingIndicator />}
          </div>
        )}

        <CompareBar
          selectedCars={selectedCars}
          onRemove={removeFromCompare}
          onClear={clearCompare}
          onOpenCompare={() => setShowCompare(true)}
        />

        <ChatInput
          inputRef={inputRef}
          value={input}
          onChange={setInput}
          onSend={send}
          loading={loading || streaming}
        />
      </main>

      {showCompare && selectedCars.length === 2 && (
        <CompareModal
          cars={selectedCars}
          onClose={() => setShowCompare(false)}
          onRemove={(car) => {
            removeFromCompare(car);
            setShowCompare(false);
          }}
        />
      )}
    </div>
  );
}