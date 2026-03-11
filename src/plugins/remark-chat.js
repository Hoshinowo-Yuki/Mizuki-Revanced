import { visit } from 'unist-util-visit';

export function remarkChat() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'containerDirective' && node.name === 'chat') {
        const messages = [];
        let currentMessage = null;

        for (const child of node.children) {
          if (child.type === 'paragraph' && child.children?.[0]?.type === 'text') {
            const text = child.children[0].value;
            // 匹配 [Name|Date] 或 [Name|Date|right]
            const headerMatch = text.match(/^\[([^\]|]+)\|([^\]|]+)(?:\|(\w+))?\]/);
            
            if (headerMatch) {
              // 如果有之前的訊息，先保存
              if (currentMessage) {
                messages.push(currentMessage);
              }
              
              const [fullMatch, name, date, position] = headerMatch;
              const remainingText = text.slice(fullMatch.length).trim();
              
              currentMessage = {
                name,
                date,
                position: position || 'left',
                content: []
              };
              
              // 如果 header 後面還有文字，加入 content
              if (remainingText) {
                currentMessage.content.push({
                  type: 'paragraph',
                  children: [{ type: 'text', value: remainingText }]
                });
              }
            } else if (currentMessage) {
              // 不是 header，加入當前訊息的 content
              currentMessage.content.push(child);
            }
          } else if (currentMessage) {
            // blockquote 或其他類型
            currentMessage.content.push(child);
          }
        }
        
        // 別忘了最後一個訊息
        if (currentMessage) {
          messages.push(currentMessage);
        }

        console.log('Parsed messages:', JSON.stringify(messages, null, 2));

        // 轉換成 HTML 結構
        node.children = messages.map(msg => ({
          type: 'containerDirective',
          data: {
            hName: 'div',
            hProperties: {
              className: ['chat-message', `chat-${msg.position}`],
              'data-name': msg.name,
              'data-date': msg.date
            }
          },
          children: [
            {
              type: 'paragraph',
              data: {
                hName: 'div',
                hProperties: { className: ['chat-header'] }
              },
              children: [
                {
                  type: 'html',
                  value: `<span class="chat-name">${msg.name}</span><span class="chat-date">${msg.date}</span>`
                }
              ]
            },
            {
              type: 'paragraph',
              data: {
                hName: 'div',
                hProperties: { className: ['chat-content'] }
              },
              children: msg.content.flatMap(c => c.children || [c])
            }
          ]
        }));

        // 設定容器
        const data = node.data || (node.data = {});
        data.hName = 'div';
        data.hProperties = { className: ['chat-container'] };
      }
    });
  };
}

export default remarkChat;