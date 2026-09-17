import { UIMessage } from 'ai';

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';

  const content = message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-spring-up`}>
      <div 
        className={`max-w-[80%] md:max-w-[70%] p-4 ${
          isUser 
            ? 'bg-primary text-foreground border-2 border-foreground rounded-[16px] rounded-br-[4px] shadow-[4px_4px_0px_0px_var(--foreground)] font-bold' 
            : 'bg-[#F9FFF4] border-2 border-foreground rounded-[16px] rounded-tl-[4px] shadow-[4px_4px_0px_0px_var(--foreground)] font-bold'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}
