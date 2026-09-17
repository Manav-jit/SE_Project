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
        className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl ${
          isUser 
            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
            : 'glass-panel rounded-tl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}
