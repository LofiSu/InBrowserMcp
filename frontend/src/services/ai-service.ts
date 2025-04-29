// AI服务，用于与OpenAI API通信
import axios from "axios";

// 消息类型
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// 工具参数类型
export type ToolArgs = Record<
  string,
  string | number | boolean | null | undefined
>;

// AI响应类型
export interface AiResponse {
  text: string;
  tools?: {
    name: string;
    args: {
      url?: string;
      element?: string;
      text?: string;
    } | undefined;
  }[];
}

// 错误类型
export class AiServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiServiceError";
  }
}

// OpenAI工具调用接口
interface ToolCall {
  function: {
    name: string;
    arguments: string;
  };
}

// OpenAI API响应类型
interface OpenAIApiResponse {
  choices: Array<{
    message: {
      content: string | null;
      tool_calls?: ToolCall[];
    };
  }>;
}

// OpenAI工具参数类型
interface ExecuteBrowserActionParams {
  tool: string;
  parameters?: {
    url?: string;
    element?: string;
    text?: string;
  };
}

export class AiService {
  private apiKey: string;
  private baseUrl: string = "https://api.openai.com/v1/chat/completions";
  private model: string = "gpt-4o";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 设置API密钥
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * 发送消息到AI并获取回复
   */
  async sendMessage(
    messages: Message[],
    systemPrompt?: string
  ): Promise<AiResponse> {
    if (!this.apiKey) {
      throw new AiServiceError("未设置API密钥");
    }

    // 添加系统消息
    const allMessages: Message[] = [];
    if (systemPrompt) {
      allMessages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    // 添加用户对话
    allMessages.push(...messages);

    try {
      const response = await axios.post<OpenAIApiResponse>(
        this.baseUrl,
        {
          model: this.model,
          messages: allMessages,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          max_tokens: 1500,
          tools: [
            {
              type: "function",
              function: {
                name: "execute_browser_action",
                description: "执行浏览器操作",
                parameters: {
                  type: "object",
                  properties: {
                    tool: {
                      type: "string",
                      description: "要执行的工具名称",
                      enum: [
                        "navigate",
                        "click",
                        "type",
                        "snapshot",
                        "screenshot",
                        "goBack",
                        "goForward",
                      ],
                    },
                    parameters: {
                      type: "object",
                      description: "工具参数",
                      properties: {
                        url: { type: "string", description: "导航URL" },
                        element: {
                          type: "string",
                          description: "目标元素选择器",
                        },
                        text: { type: "string", description: "要输入的文本" },
                      },
                    },
                  },
                  required: ["tool"],
                },
              },
            },
          ],
          tool_choice: "auto",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      const aiMessage = response.data.choices[0].message;

      // 处理可能的工具调用
      const toolCalls = aiMessage.tool_calls || [];
      const tools = toolCalls
        .map((call: ToolCall) => {
          if (
            call.function &&
            call.function.name === "execute_browser_action"
          ) {
            const args = JSON.parse(
              call.function.arguments
            ) as ExecuteBrowserActionParams;
            return {
              name: args.tool,
              args: args.parameters,
            };
          }
          return null;
        })
        .filter((tool): tool is { name: string; args: { url?: string; element?: string; text?: string; } | undefined; } => tool !== null);

      return {
        text: aiMessage.content || "",
        tools: tools.length > 0 ? tools : undefined,
      };
    } catch (error) {
      console.error("AI服务错误:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error?.message || error.message;
        throw new AiServiceError(`API请求失败: ${errorMessage}`);
      }
      throw new AiServiceError(`未知错误: ${(error as Error).message}`);
    }
  }
}
