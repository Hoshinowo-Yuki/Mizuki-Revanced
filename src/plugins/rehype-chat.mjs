import { visit } from 'unist-util-visit';

export function remarkChat() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'chat') return;

      const lines = node.value.split('\n');
      const messages = [];
      let current = null;

      for (const line of lines) {
        // Match: [username] or [username|position] or [username|position|replyTo]
        const headerMatch = line.match(/^\[([^\]|]+)(?:\|([^\]|]+))?(?:\|([^\]]+))?\]\s*(.*)$/);

        if (headerMatch) {
          if (current) messages.push(current);
          const [, username, pos, replyTo, rest] = headerMatch;
          current = {
            username: username.trim(),
            position: pos?.trim() || 'left',
            replyTo: replyTo?.trim() || null,
            time: null,
            content: []
          };

          // Check for timestamp
          const timeMatch = rest.match(/^\(([^)]+)\)\s*(.*)$/);
          if (timeMatch) {
            current.time = timeMatch[1];
            if (timeMatch[2]) current.content.push(timeMatch[2]);
          } else if (rest) {
            current.content.push(rest);
          }
        } else if (current) {
          current.content.push(line);
        }
      }
      if (current) messages.push(current);

      // Build HTML
      const chatHtml = messages.length === 0
        ? `<div class="chat-container chat-empty">No messages</div>`
        : `<div class="chat-container">${messages.map(msg => {
            const pos = msg.position === 'right' ? 'right' : 'left';
            const replyHtml = msg.replyTo 
              ? `<span class="chat-reply-to"><span class="iconify" data-icon="fa6-solid:reply"></span> @${msg.replyTo}</span>` 
              : '';
            return `
              <div class="chat-message chat-${pos}">
                <div class="chat-bubble">
                  <div class="chat-header">
                    <span class="chat-username">${msg.username}</span>
                    ${msg.time ? `<span class="chat-timestamp">${msg.time}</span>` : ''}
                  </div>
                  <div class="chat-content">
                    ${replyHtml}
                    ${msg.content.join('\n')}
                  </div>
                </div>
              </div>
            `;
          }).join('')}</div>`;

      parent.children[index] = {
        type: 'html',
        value: chatHtml
      };
    });
  };
}

export default remarkChat;