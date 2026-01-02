// NotebookLM Research Assistant - 메인 앱 컴포넌트
import { Header, Sidebar, ChatArea, MessageInput, ToastContainer } from './components';
import { useLocale, useResearchSession } from './hooks';

function App() {
  const { t } = useLocale();
  const {
    notebooks,
    selectedNotebook,
    session,
    isLoadingNotebooks,
    isCreatingSession,
    isSendingMessage,
    isGeneratingDoc,
    toasts,
    selectNotebook,
    createSession,
    sendMessage,
    generateDocument,
    downloadDocument,
    dismissToast,
    resetSession,
  } = useResearchSession();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header session={session} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          notebooks={notebooks}
          selectedNotebook={selectedNotebook}
          session={session}
          isLoadingNotebooks={isLoadingNotebooks}
          isCreatingSession={isCreatingSession}
          isGeneratingDoc={isGeneratingDoc}
          onSelectNotebook={selectNotebook}
          onCreateSession={createSession}
          onGenerateDoc={generateDocument}
          onDownloadDoc={downloadDocument}
          onResetSession={resetSession}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatArea
            messages={session?.messages ?? []}
            isLoading={isSendingMessage}
            hasSession={!!session}
          />

          {session && (
            <MessageInput
              onSend={sendMessage}
              disabled={isSendingMessage}
              placeholder={t.messageInput.sessionPlaceholder}
            />
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App
