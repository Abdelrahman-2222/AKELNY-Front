import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
  typing?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  isTyping = false;

  // Food-related quick responses
  quickReplies = [
    "🍕 Browse Menu",
    "🚚 Track Order",
    "👨‍🍳 Find Chefs",
    "💰 Pricing Info"
  ];

  ngOnInit() {
    // Load chat history from localStorage
    this.loadChatHistory();

    // Welcome message
    if (this.messages.length === 0) {
      this.addBotMessage("🍽️ Hi! I'm Akalni Assistant. How can I help you today?");
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;

    // Add user message
    this.addUserMessage(this.currentMessage);
    const userMessage = this.currentMessage;
    this.currentMessage = '';

    // Show typing indicator
    this.showTypingIndicator();

    // Simulate AI response delay
    setTimeout(() => {
      this.hideTypingIndicator();
      this.generateAIResponse(userMessage);
    }, 1500);
  }

  sendQuickReply(reply: string) {
    this.addUserMessage(reply);
    this.showTypingIndicator();

    setTimeout(() => {
      this.hideTypingIndicator();
      this.generateAIResponse(reply);
    }, 1000);
  }

  private generateAIResponse(userMessage: string) {
    const response = this.getAIResponse(userMessage.toLowerCase());
    this.addBotMessage(response);
  }

  private getAIResponse(message: string): string {
    // Simple AI logic - you can integrate with OpenAI API later
    if (message.includes('menu') || message.includes('food') || message.includes('browse')) {
      return "🍽️ Great! You can browse our delicious menu by clicking 'Browse Chefs' in the navigation. We have Italian, Asian, Mediterranean and more cuisines available!";
    }

    if (message.includes('order') || message.includes('track')) {
      return "📦 To track your order, please go to 'My Orders' in your profile. You'll see real-time updates of your order status from preparation to delivery!";
    }

    if (message.includes('chef') || message.includes('cook')) {
      return "👨‍🍳 Our platform features verified local chefs who cook authentic homemade meals. Each chef has ratings, reviews, and specialties listed on their profile!";
    }

    if (message.includes('price') || message.includes('cost') || message.includes('expensive')) {
      return "💰 Our prices vary by chef and dish complexity. Most meals range from $8-25. You can filter by price range when browsing. Free delivery on orders over $30!";
    }

    if (message.includes('delivery') || message.includes('time')) {
      return "🚚 Delivery typically takes 30-60 minutes depending on chef preparation time and your location. You'll get real-time updates via notifications!";
    }

    if (message.includes('hello') || message.includes('hi') || message.includes('help')) {
      return "👋 Hello! I'm here to help with any questions about Akalni. You can ask me about our menu, ordering process, chefs, delivery, or anything else!";
    }

    // Default response
    return "🤔 I understand you're asking about '" + message + "'. For specific questions, please contact our support team at support@akalni.com or call (555) 123-FOOD. Is there anything else I can help you with?";
  }

  private addUserMessage(text: string) {
    const message: ChatMessage = {
      text,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(message);
    this.saveChatHistory();
    this.scrollToBottom();
  }

  private addBotMessage(text: string) {
    const message: ChatMessage = {
      text,
      isUser: false,
      timestamp: new Date()
    };
    this.messages.push(message);
    this.saveChatHistory();
    this.scrollToBottom();
  }

  private showTypingIndicator() {
    this.isTyping = true;
    this.scrollToBottom();
  }

  private hideTypingIndicator() {
    this.isTyping = false;
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private saveChatHistory() {
    localStorage.setItem('akalni_chat_history', JSON.stringify(this.messages));
  }

  private loadChatHistory() {
    const saved = localStorage.getItem('akalni_chat_history');
    if (saved) {
      this.messages = JSON.parse(saved);
    }
  }

  clearChat() {
    this.messages = [];
    localStorage.removeItem('akalni_chat_history');
    this.addBotMessage("🍽️ Chat cleared! How can I help you today?");
  }
}
