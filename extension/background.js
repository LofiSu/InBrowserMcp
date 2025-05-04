// background.js

const WS_URL = "ws://localhost:8081"; // 后端 WebSocket 服务器地址
let ws = null;
let reconnectInterval = 5000; // 重连间隔 5 秒

function connectWebSocket() {
// 检查是否已有连接或正在连接
if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return; 
  }
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log(`✅ WebSocket 连接成功到 ${WS_URL}. ReadyState: ${ws.readyState}`);
    // 向服务器发送一个测试消息
  ws.send(JSON.stringify({type: 'test', payload: {message: 'Hello from extension'}}));
  };
  console.log('⏳ 即将设置 onmessage 监听器...');
  ws.onmessage = (event) => {
    console.log(`📩 ===`);
    console.log(`📩 [RAW] 收到 WebSocket 消息: ${event.data}`); 
    try {
      const message = JSON.parse(event.data);
      console.log('✅ WebSocket 消息解析成功:', message); 
      handleServerCommand(message.type, message.payload);
    } catch (error) {
      console.error('❌ 解析 WebSocket 消息失败:', error, '原始消息:', event.data);
    }
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket 错误:', error);
    console.error(`❌ WebSocket 错误详情: Type=${error.type}`);
    // 错误发生时，onclose 也会被调用，在那里处理重连
  };

  ws.onclose = (event) => {
    console.log(`🔌 WebSocket 连接已断开. Code: ${event.code}, Reason: '${event.reason}', WasClean: ${event.wasClean}. ReadyState before close: ${ws?.readyState}`);
    ws = null;
    console.log(`🔌 ${reconnectInterval / 1000}秒后尝试重连...`);
    // 尝试重新连接
    setTimeout(connectWebSocket, reconnectInterval);
  };
}

// 立即开始连接
connectWebSocket();

// 处理来自服务器的指令
async function handleServerCommand(type, payload) {
  console.log(`🏁 [handleServerCommand] 开始处理指令: type=${type}`); // Log entry into the function
  console.log(`⚙️ 处理服务器指令: type=${type}, payload=`, payload);
  switch (type) {
    case 'navigate':
      if (payload && payload.url) {
        await navigateToUrl(payload.url);
      } else {
        console.error('❌ navigate 指令缺少 url');
      }
      break;
    case 'click':
      if (payload && payload.selector) {
        await clickElement(payload.selector);
      } else {
        console.error('❌ click 指令缺少 selector');
      }
      break;
    case 'type':
      if (payload && payload.selector && payload.text !== undefined) {
        await typeInElement(payload.selector, payload.text);
      } else {
        console.error('❌ type 指令缺少 selector 或 text');
      }
      break;
    case 'get_content':
      // get_content 可能不需要 payload，或者需要指定区域的 selector
      await getPageContent(payload?.selector);
      break;
    case 'scroll':
      if (payload && (payload.direction || payload.selector)) {
        await scrollPage(payload.direction, payload.selector, payload.amount);
      } else {
        console.error('❌ scroll 指令缺少 direction 或 selector');
      }
      break;
    case 'get_attribute':
      if (payload && payload.selector && payload.attribute) {
        await getElementAttribute(payload.selector, payload.attribute);
      } else {
        console.error('❌ get_attribute 指令缺少 selector 或 attribute');
      }
      break;
    case 'execute_script':
      if (payload && payload.script) {
        await executeCustomScript(payload.script, payload.args);
      } else {
        console.error('❌ execute_script 指令缺少 script');
      }
      break;
    case 'wait_for_element':
      if (payload && payload.selector) {
        await waitForElement(payload.selector, payload.timeout || 5000, payload.visible);
      } else {
        console.error('❌ wait_for_element 指令缺少 selector');
      }
      break;
    case 'switch_tab':
      if (payload && payload.tabId) {
        await switchTab(payload.tabId);
      } else {
        console.error('❌ switch_tab 指令缺少 tabId');
      }
      break;
    case 'close_tab':
      await closeCurrentTab();
      break;
    case 'go_back':
      await goBack();
      break;
    case 'go_forward':
      await goForward();
      break;
    case 'screenshot':
      await takeScreenshot(payload?.format || 'png', payload?.quality);
      break;
    case 'get_current_state':
      await getCurrentState();
      break;
    case 'get_cookies':
      await getCookies(payload?.url, payload?.name);
      break;
    case 'set_cookie':
      if (payload && payload.cookie) {
        await setCookie(payload.cookie);
      } else {
        console.error('❌ set_cookie 指令缺少 cookie 对象');
      }
      break;
    case 'delete_cookie':
      if (payload && payload.url && payload.name) {
        await deleteCookie(payload.url, payload.name);
      } else {
        console.error('❌ delete_cookie 指令缺少 url 或 name');
      }
      break;
    case 'get_storage':
      if (payload && payload.key) {
        await getStorageItem(payload.key, payload.storageType || 'local');
      } else {
        console.error('❌ get_storage 指令缺少 key');
      }
      break;
    case 'set_storage':
      if (payload && payload.key && payload.value !== undefined) {
        await setStorageItem(payload.key, payload.value, payload.storageType || 'local');
      } else {
        console.error('❌ set_storage 指令缺少 key 或 value');
      }
      break;
    case 'delete_storage':
      if (payload && payload.key) {
        await deleteStorageItem(payload.key, payload.storageType || 'local');
      } else {
        console.error('❌ delete_storage 指令缺少 key');
      }
      break;
    case 'refresh_page':
      await refreshPage();
      break;
    case 'get_all_tabs':
      await getAllTabs();
      break;
    case 'hover_element':
       if (payload && payload.selector) {
         await hoverElement(payload.selector);
       } else {
         console.error('❌ hover_element 指令缺少 selector');
       }
       break;
    // Removed duplicate 'screenshot' case
    // Removed duplicate 'close_tab' case
    case 'create_tab':
      await createTab(payload?.url, payload?.active);
      break;
    case 'focus_tab':
      if (payload && payload.tabId) {
        await focusTab(payload.tabId);
      } else {
        console.error('❌ focus_tab 指令缺少 tabId');
      }
      break;
    // Window Management
    case 'create_window':
      await createWindow(payload?.url, payload?.focused, payload?.type, payload?.state);
      break;
    case 'close_window':
      if (payload && payload.windowId) {
        await closeWindow(payload.windowId);
      } else {
        console.error('❌ close_window 指令缺少 windowId');
      }
      break;
    case 'get_all_windows':
      await getAllWindows(payload?.populate);
      break;
    case 'focus_window':
      if (payload && payload.windowId) {
        await focusWindow(payload.windowId);
      } else {
        console.error('❌ focus_window 指令缺少 windowId');
      }
      break;
    // History Management
    case 'search_history':
      if (payload && payload.query) {
        await searchHistory(payload.query);
      } else {
        console.error('❌ search_history 指令缺少 query');
      }
      break;
    case 'delete_history_url':
      if (payload && payload.url) {
        await deleteHistoryUrl(payload.url);
      } else {
        console.error('❌ delete_history_url 指令缺少 url');
      }
      break;
    // Bookmark Management
    case 'create_bookmark':
      if (payload && payload.url) {
        await createBookmark(payload.url, payload.title, payload.parentId);
      } else {
        console.error('❌ create_bookmark 指令缺少 url');
      }
      break;
    case 'search_bookmarks':
      if (payload && payload.query) {
        await searchBookmarks(payload.query);
      } else {
        console.error('❌ search_bookmarks 指令缺少 query');
      }
      break;
    // Browsing Data
    case 'clear_browsing_data':
      if (payload && payload.dataTypes) {
        await clearBrowsingData(payload.dataTypes, payload.options);
      } else {
        console.error('❌ clear_browsing_data 指令缺少 dataTypes');
      }
      break;
    default:
      console.warn(`⚠️ 未知的服务器指令类型: ${type}`);
  }
  // 可以考虑向服务器发送操作结果，但这需要服务器端支持接收和处理
  // if (ws && ws.readyState === WebSocket.OPEN) {
  //   ws.send(JSON.stringify({ type: 'action_result', originalType: type, status: 'success/error', details: {} }));
  // }
}

// --- 浏览器操作函数 ---

async function navigateToUrl(url) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      console.log(`🚀 导航到: ${url}`);
      await chrome.tabs.update(tab.id, { url: url });
      // 注意：这里仅发起导航，不保证页面加载完成
      // 可能需要结合 content script 的 page_loaded 消息来确认
    } else {
      console.warn('⚠️ 没有找到活动标签页来执行导航');
      // 如果没有活动标签页，可以考虑创建一个新标签页
      // await chrome.tabs.create({ url: url });
    }
  } catch (error) {
    console.error(`❌ 导航到 ${url} 失败:`, error);
  }
}

// 点击元素
async function clickElement(selector) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.warn('⚠️ 没有找到活动标签页来执行点击');
    return;
  }
  try {
    console.log(`🖱️ 尝试点击元素: ${selector}`);
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (sel) => {
        const element = document.querySelector(sel);
        if (element && typeof element.click === 'function') {
          element.click();
          return { success: true };
        } else {
          return { success: false, error: `Element not found or not clickable: ${sel}` };
        }
      },
      args: [selector]
    });
    // 处理注入脚本的结果
    if (results && results[0] && results[0].result) {
      if (!results[0].result.success) {
        console.error(`❌ 点击元素失败: ${results[0].result.error}`);
      } else {
        console.log(`✅ 点击元素成功: ${selector}`);
      }
    } else {
       console.error(`❌ 点击元素时注入脚本失败或无结果: ${selector}`);
    }
  } catch (error) {
    console.error(`❌ 点击元素 ${selector} 时发生错误:`, error);
  }
}

// 在元素中输入文本
async function typeInElement(selector, text) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.warn('⚠️ 没有找到活动标签页来执行输入');
    return;
  }
  try {
    console.log(`⌨️ 尝试在元素 ${selector} 中输入: ${text}`);
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (sel, txt) => {
        const element = document.querySelector(sel);
        // 简单实现，直接设置 value。对于复杂输入框可能需要模拟事件。
        if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
          element.value = txt;
          // 触发 input 事件，让一些框架（如 React）能检测到变化
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          return { success: true };
        } else {
          return { success: false, error: `Element not found or not an input/textarea: ${sel}` };
        }
      },
      args: [selector, text]
    });
    // 处理注入脚本的结果
    if (results && results[0] && results[0].result) {
      if (!results[0].result.success) {
        console.error(`❌ 输入文本失败: ${results[0].result.error}`);
      } else {
        console.log(`✅ 输入文本成功: ${selector}`);
      }
    } else {
       console.error(`❌ 输入文本时注入脚本失败或无结果: ${selector}`);
    }
  } catch (error) {
    console.error(`❌ 在元素 ${selector} 输入时发生错误:`, error);
  }
}

// 获取页面内容（或指定元素内容）
async function getPageContent(selector) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.warn('⚠️ 没有找到活动标签页来获取内容');
    return;
  }
  try {
    console.log(`📄 尝试获取内容 ${selector ? '来自元素 ' + selector : '来自页面'}`);
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (sel) => {
        const element = sel ? document.querySelector(sel) : document.body;
        if (element) {
          // 返回 innerText 通常更接近用户看到的内容
          return { success: true, content: element.innerText };
        } else {
          return { success: false, error: `Element not found: ${sel}` };
        }
      },
      args: [selector] // 如果 selector 为 null 或 undefined，则 func 中的 sel 也是
    });
    // 处理注入脚本的结果
    if (results && results[0] && results[0].result) {
      if (results[0].result.success) {
        console.log(`✅ 获取内容成功 ${selector ? '来自元素 ' + selector : ''}`);
        // TODO: 将获取到的内容发送回服务器
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_content', status: 'success', details: { content: results[0].result.content } }));
        }
        return results[0].result.content;
      } else {
        console.error(`❌ 获取内容失败: ${results[0].result.error}`);
      }
    } else {
       console.error(`❌ 获取内容时注入脚本失败或无结果 ${selector ? '来自元素 ' + selector : ''}`);
    }
  } catch (error) {
    console.error(`❌ 获取内容 ${selector ? '来自元素 ' + selector : ''} 时发生错误:`, error);
  }
  return null;
}

// 滚动页面
async function scrollPage(direction, selector, amount) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.warn('⚠️ 没有找到活动标签页来执行滚动');
    return;
  }
  try {
    console.log(`↕️ 尝试滚动页面: ${direction || '到元素 ' + selector}`);
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (dir, sel, amt) => {
        if (sel) {
          const element = document.querySelector(sel);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return { success: true };
          } else {
            return { success: false, error: `Element not found for scrolling: ${sel}` };
          }
        } else if (dir) {
          let scrollAmount = amt || window.innerHeight * 0.8; // 默认滚动 80% 视窗高度
          if (dir === 'up') scrollAmount = -scrollAmount;
          window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
          return { success: true };
        } else {
           return { success: false, error: 'Scroll direction or selector required' };
        }
      },
      args: [direction, selector, amount]
    });
    if (results && results[0] && results[0].result && !results[0].result.success) {
      console.error(`❌ 滚动失败: ${results[0].result.error}`);
    } else if (!results || !results[0] || !results[0].result) {
      console.error(`❌ 滚动时注入脚本失败或无结果`);
    } else {
      console.log(`✅ 滚动成功`);
    }
  } catch (error) {
    console.error(`❌ 滚动页面时发生错误:`, error);
  }
}

// 获取元素属性
async function getElementAttribute(selector, attribute) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.warn('⚠️ 没有找到活动标签页来获取属性');
    return;
  }
  try {
    console.log(`🏷️ 尝试获取元素 ${selector} 的属性 ${attribute}`);
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (sel, attr) => {
        const element = document.querySelector(sel);
        if (element) {
          const value = element.getAttribute(attr);
          return { success: true, attributeValue: value };
        } else {
          return { success: false, error: `Element not found: ${sel}` };
        }
      },
      args: [selector, attribute]
    });
    if (results && results[0] && results[0].result) {
      if (results[0].result.success) {
        console.log(`✅ 获取属性 ${attribute} 成功: ${results[0].result.attributeValue}`);
        // 将获取到的属性值发送回服务器
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_attribute', status: 'success', details: { attribute: attribute, value: results[0].result.attributeValue } }));
        }
        return results[0].result.attributeValue;
      } else {
        console.error(`❌ 获取属性失败: ${results[0].result.error}`);
      }
    } else {
      console.error(`❌ 获取属性时注入脚本失败或无结果`);
    }
  } catch (error) {
    console.error(`❌ 获取元素 ${selector} 属性 ${attribute} 时发生错误:`, error);
  }
  return null;
}

// 执行自定义脚本
async function executeCustomScript(script, args = []) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.warn('⚠️ 没有找到活动标签页来执行脚本');
    return;
  }
  try {
    console.log(`⚡ 尝试执行自定义脚本`);
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: new Function('...args', script), // 将字符串脚本转换为函数
      args: args // 传递参数给脚本
    });
    // 处理注入脚本的结果
    const result = results && results[0] ? results[0].result : undefined;
    console.log(`✅ 自定义脚本执行完成，结果:`, result);
    // 将执行结果发送回服务器
    if (ws && ws.readyState === WebSocket.OPEN) {
      // 注意：结果可能是任何可序列化的类型，需要处理 undefined 等情况
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'execute_script', status: 'success', details: { result: result === undefined ? null : result } }));
    }
    return result;
  } catch (error) {
    console.error(`❌ 执行自定义脚本时发生错误:`, error);
    // 将错误信息发送回服务器
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'execute_script', status: 'error', details: { error: error.message } }));
    }
  }
  return null;
}

// 等待元素出现
async function waitForElement(selector, timeout = 5000, visible = true) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.warn('⚠️ 没有找到活动标签页来等待元素');
    return false;
  }
  console.log(`⏱️ 等待元素 ${selector} ${visible ? '可见' : '存在'} (超时: ${timeout}ms)`);
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (sel, timeoutMs, checkVisible) => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          const interval = setInterval(() => {
            const element = document.querySelector(sel);
            let found = false;
            if (element) {
              if (checkVisible) {
                const style = window.getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                // 检查可见性：非隐藏、有尺寸、在视窗内（粗略检查）
                if (style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0) {
                   found = true;
                }
              } else {
                found = true; // 只检查存在
              }
            }

            if (found) {
              clearInterval(interval);
              resolve({ success: true });
            } else if (Date.now() - startTime > timeoutMs) {
              clearInterval(interval);
              reject(new Error(`Timeout waiting for element: ${sel}`));
            }
          }, 100); // 每 100ms 检查一次
        });
      },
      args: [selector, timeout, visible]
    });

    if (results && results[0] && results[0].result && results[0].result.success) {
      console.log(`✅ 元素 ${selector} 已找到`);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'wait_for_element', status: 'success', details: { selector: selector } }));
      }
      return true;
    } else {
      // executeScript 本身可能抛出错误，或者 func reject
      const errorMsg = results && results[0] && results[0].result ? results[0].result.error : 'Unknown error or timeout';
      console.error(`❌ 等待元素 ${selector} 失败: ${errorMsg}`);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'wait_for_element', status: 'error', details: { selector: selector, error: errorMsg } }));
      }
      return false;
    }
  } catch (error) {
    // 这个 catch 捕获 executeScript 调用本身的错误或 func 中的 reject
    console.error(`❌ 等待元素 ${selector} 时发生错误:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'wait_for_element', status: 'error', details: { selector: selector, error: error.message } }));
    }
    return false;
  }
}

// 切换标签页
async function switchTab(tabId) {
  try {
    console.log(`🔄 切换到标签页 ID: ${tabId}`);
    await chrome.tabs.update(tabId, { active: true });
    console.log(`✅ 已切换到标签页 ID: ${tabId}`);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'switch_tab', status: 'success', details: { tabId: tabId } }));
    }
  } catch (error) {
    console.error(`❌ 切换到标签页 ${tabId} 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'switch_tab', status: 'error', details: { tabId: tabId, error: error.message } }));
    }
  }
}

// 关闭当前标签页
async function closeCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      console.log(`🚪 关闭当前标签页 ID: ${tab.id}`);
      await chrome.tabs.remove(tab.id);
      console.log(`✅ 当前标签页已关闭`);
       if (ws && ws.readyState === WebSocket.OPEN) {
         ws.send(JSON.stringify({ type: 'action_result', originalType: 'close_tab', status: 'success', details: { closedTabId: tab.id } }));
       }
    } else {
      console.warn('⚠️ 没有找到活动标签页来关闭');
       if (ws && ws.readyState === WebSocket.OPEN) {
         ws.send(JSON.stringify({ type: 'action_result', originalType: 'close_tab', status: 'error', details: { error: 'No active tab found' } }));
       }
    }
  } catch (error) {
    console.error(`❌ 关闭当前标签页失败:`, error);
     if (ws && ws.readyState === WebSocket.OPEN) {
       ws.send(JSON.stringify({ type: 'action_result', originalType: 'close_tab', status: 'error', details: { error: error.message } }));
     }
  }
}

// 后退
async function goBack() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      console.log(`⬅️ 后退`);
      await chrome.tabs.goBack(tab.id);
      console.log(`✅ 后退操作已发送`);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'go_back', status: 'success', details: {} }));
      }
    } else {
      console.warn('⚠️ 没有找到活动标签页执行后退');
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'go_back', status: 'error', details: { error: 'No active tab found' } }));
      }
    }
  } catch (error) {
    console.error(`❌ 后退失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'go_back', status: 'error', details: { error: error.message } }));
    }
  }
}

// 前进
async function goForward() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      console.log(`➡️ 前进`);
      await chrome.tabs.goForward(tab.id);
      console.log(`✅ 前进操作已发送`);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'go_forward', status: 'success', details: {} }));
      }
    } else {
      console.warn('⚠️ 没有找到活动标签页执行前进');
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'go_forward', status: 'error', details: { error: 'No active tab found' } }));
      }
    }
  } catch (error) {
    console.error(`❌ 前进失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'go_forward', status: 'error', details: { error: error.message } }));
    }
  }
}

// 截图
async function takeScreenshot(format = 'png', quality) {
  try {
    console.log(`📸 截取可见区域 (格式: ${format}${quality ? ', 质量: ' + quality : ''})`);
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: format, quality: quality });
    console.log(`✅ 截图成功`);
    // 将截图数据（Base64）发送回服务器
    if (ws && ws.readyState === WebSocket.OPEN) {
      // 注意：截图数据可能很大，确保 WebSocket 连接和服务器能处理
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'screenshot', status: 'success', details: { imageDataUrl: dataUrl } }));
    }
    return dataUrl;
  } catch (error) {
    console.error(`❌ 截图失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'screenshot', status: 'error', details: { error: error.message } }));
    }
  }
  return null;
}

// 获取当前页面状态 (URL, Title)
async function getCurrentState() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      console.log(`ℹ️ 获取当前状态: URL=${tab.url}, Title=${tab.title}`);
      const state = { url: tab.url, title: tab.title, tabId: tab.id };
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_current_state', status: 'success', details: state }));
      }
      return state;
    } else {
      console.warn('⚠️ 没有找到活动标签页获取状态');
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_current_state', status: 'error', details: { error: 'No active tab found' } }));
      }
    }
  } catch (error) {
    console.error(`❌ 获取当前状态失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_current_state', status: 'error', details: { error: error.message } }));
    }
  }
  return null;
}

// 获取 Cookies
async function getCookies(url, name) {
  try {
    const details = {};
    if (url) details.url = url;
    if (name) details.name = name;
    console.log(`🍪 获取 Cookies:`, details);
    const cookies = await chrome.cookies.getAll(details);
    console.log(`✅ 获取 Cookies 成功:`, cookies);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_cookies', status: 'success', details: { cookies: cookies } }));
    }
    return cookies;
  } catch (error) {
    console.error(`❌ 获取 Cookies 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_cookies', status: 'error', details: { error: error.message } }));
    }
  }
  return null;
}

// 设置 Cookie
async function setCookie(cookieDetails) {
  // 需要 url, name, value. 其他可选: domain, path, secure, httpOnly, expirationDate, sameSite, storeId
  if (!cookieDetails.url || !cookieDetails.name || cookieDetails.value === undefined) {
     console.error('❌ 设置 Cookie 缺少必要的 url, name, 或 value');
     if (ws && ws.readyState === WebSocket.OPEN) {
       ws.send(JSON.stringify({ type: 'action_result', originalType: 'set_cookie', status: 'error', details: { error: 'Missing required cookie properties (url, name, value)' } }));
     }
     return;
  }
  try {
    console.log(`🍪 设置 Cookie:`, cookieDetails);
    const cookie = await chrome.cookies.set(cookieDetails);
    if (cookie) {
      console.log(`✅ 设置 Cookie 成功:`, cookie);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'set_cookie', status: 'success', details: { cookie: cookie } }));
      }
    } else {
      // 如果设置失败（例如，由于无效的域），API 可能返回 null 或抛出错误
      console.error(`❌ 设置 Cookie 失败 (API 返回 null/undefined)`);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'set_cookie', status: 'error', details: { error: 'Failed to set cookie (API returned null/undefined)' } }));
      }
    }
  } catch (error) {
    console.error(`❌ 设置 Cookie 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'set_cookie', status: 'error', details: { error: error.message } }));
    }
  }
}

// 删除 Cookie
async function deleteCookie(url, name) {
  try {
    console.log(`🍪 删除 Cookie: url=${url}, name=${name}`);
    const details = await chrome.cookies.remove({ url: url, name: name });
    if (details) {
      console.log(`✅ 删除 Cookie 成功:`, details);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'delete_cookie', status: 'success', details: details }));
      }
    } else {
      console.warn(`⚠️ 删除 Cookie 可能未找到: url=${url}, name=${name}`);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'delete_cookie', status: 'warning', details: { message: 'Cookie not found or could not be removed' } }));
      }
    }
  } catch (error) {
    console.error(`❌ 删除 Cookie 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'delete_cookie', status: 'error', details: { error: error.message } }));
    }
  }
}

// 获取 Local/Session Storage Item
async function getStorageItem(key, storageType = 'local') {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.warn(`⚠️ 没有找到活动标签页来获取 ${storageType}Storage`);
    return null;
  }
  const storageApi = storageType === 'session' ? 'sessionStorage' : 'localStorage';
  try {
    console.log(`💾 获取 ${storageApi} Item: key=${key}`);
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (k, api) => window[api].getItem(k),
      args: [key, storageApi]
    });
    const value = results && results[0] ? results[0].result : null;
    console.log(`✅ 获取 ${storageApi} Item 成功: key=${key}, value=${value}`);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_storage', status: 'success', details: { key: key, value: value, storageType: storageType } }));
    }
    return value;
  } catch (error) {
    console.error(`❌ 获取 ${storageApi} Item ${key} 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_storage', status: 'error', details: { key: key, storageType: storageType, error: error.message } }));
    }
  }
  return null;
}

// 设置 Local/Session Storage Item
async function setStorageItem(key, value, storageType = 'local') {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.warn(`⚠️ 没有找到活动标签页来设置 ${storageType}Storage`);
    return;
  }
  const storageApi = storageType === 'session' ? 'sessionStorage' : 'localStorage';
  try {
    console.log(`💾 设置 ${storageApi} Item: key=${key}, value=${value}`);
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (k, v, api) => window[api].setItem(k, v),
      args: [key, value, storageApi]
    });
    console.log(`✅ 设置 ${storageApi} Item 成功`);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'set_storage', status: 'success', details: { key: key, storageType: storageType } }));
    }
  } catch (error) {
    console.error(`❌ 设置 ${storageApi} Item ${key} 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'set_storage', status: 'error', details: { key: key, storageType: storageType, error: error.message } }));
    }
  }
}

// 删除 Local/Session Storage Item
async function deleteStorageItem(key, storageType = 'local') {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.warn(`⚠️ 没有找到活动标签页来删除 ${storageType}Storage`);
    return;
  }
  const storageApi = storageType === 'session' ? 'sessionStorage' : 'localStorage';
  try {
    console.log(`💾 删除 ${storageApi} Item: key=${key}`);
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (k, api) => window[api].removeItem(k),
      args: [key, storageApi]
    });
    console.log(`✅ 删除 ${storageApi} Item 成功`);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'delete_storage', status: 'success', details: { key: key, storageType: storageType } }));
    }
  } catch (error) {
    console.error(`❌ 删除 ${storageApi} Item ${key} 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'delete_storage', status: 'error', details: { key: key, storageType: storageType, error: error.message } }));
    }
  }
}

// 刷新页面
async function refreshPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      console.log(`🔄 刷新页面 ID: ${tab.id}`);
      await chrome.tabs.reload(tab.id);
      console.log(`✅ 刷新命令已发送`);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'refresh_page', status: 'success', details: {} }));
      }
    } else {
      console.warn('⚠️ 没有找到活动标签页来刷新');
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'refresh_page', status: 'error', details: { error: 'No active tab found' } }));
      }
    }
  } catch (error) {
    console.error(`❌ 刷新页面失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'refresh_page', status: 'error', details: { error: error.message } }));
    }
  }
}

// 获取所有标签页信息
async function getAllTabs() {
  try {
    console.log(`📑 获取所有标签页信息`);
    const tabs = await chrome.tabs.query({});
    console.log(`✅ 获取所有标签页成功:`, tabs);
    if (ws && ws.readyState === WebSocket.OPEN) {
      // 过滤掉一些可能不需要或过大的信息，比如 favIconUrl
      const simplifiedTabs = tabs.map(t => ({ id: t.id, index: t.index, windowId: t.windowId, url: t.url, title: t.title, active: t.active, status: t.status }));
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_all_tabs', status: 'success', details: { tabs: simplifiedTabs } }));
    }
    return tabs;
  } catch (error) {
    console.error(`❌ 获取所有标签页失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_all_tabs', status: 'error', details: { error: error.message } }));
    }
  }
  return null;
}

// 模拟鼠标悬停
async function hoverElement(selector) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.warn('⚠️ 没有找到活动标签页来模拟悬停');
    return;
  }
  try {
    console.log(`🖱️ 模拟悬停在元素: ${selector}`);
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (sel) => {
        const element = document.querySelector(sel);
        if (element) {
          const mouseOverEvent = new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window });
          const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: false, cancelable: false, view: window }); // mouseenter 不冒泡
          element.dispatchEvent(mouseEnterEvent);
          element.dispatchEvent(mouseOverEvent);
          // 注意：这只触发了事件，不保证所有悬停效果（如 CSS :hover）都被激活。
          // 对于 CSS :hover，通常需要更复杂的注入或使用 Debugger API。
          return { success: true };
        } else {
          return { success: false, error: `Element not found for hover: ${sel}` };
        }
      },
      args: [selector]
    });
    if (results && results[0] && results[0].result && !results[0].result.success) {
      console.error(`❌ 模拟悬停失败: ${results[0].result.error}`);
    } else if (!results || !results[0] || !results[0].result) {
      console.error(`❌ 模拟悬停时注入脚本失败或无结果`);
    } else {
      console.log(`✅ 模拟悬停事件已发送到元素: ${selector}`);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'action_result', originalType: 'hover_element', status: 'success', details: { selector: selector } }));
      }
    }
  } catch (error) {
    console.error(`❌ 模拟悬停在元素 ${selector} 时发生错误:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'hover_element', status: 'error', details: { selector: selector, error: error.message } }));
    }
  }
}

// 截屏
async function takeScreenshot(format = 'png', quality) {
  try {
    console.log(`📸 截取可见区域截图 (格式: ${format}, 质量: ${quality || '默认'})`);
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: format, quality: quality });
    console.log(`✅ 截图成功`);
    // 将截图数据发送回服务器
    if (ws && ws.readyState === WebSocket.OPEN) {
      // 注意：Data URL 可能非常大，考虑是否需要分块或优化
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'screenshot', status: 'success', details: { imageDataUrl: dataUrl } }));
    }
    return dataUrl;
  } catch (error) {
    console.error(`❌ 截图失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'screenshot', status: 'error', details: { error: error.message } }));
    }
  }
  return null;
}

// 关闭标签页
async function closeTab(tabId) {
  try {
    console.log(`❌ 关闭标签页 ID: ${tabId}`);
    await chrome.tabs.remove(tabId);
    console.log(`✅ 关闭标签页命令已发送`);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'close_tab', status: 'success', details: { tabId: tabId } }));
    }
  } catch (error) {
    console.error(`❌ 关闭标签页 ${tabId} 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'close_tab', status: 'error', details: { tabId: tabId, error: error.message } }));
    }
  }
}

// 创建新标签页
async function createTab(url, active = true) {
  try {
    console.log(`➕ 创建新标签页: url=${url || '默认新标签页'}, active=${active}`);
    const tab = await chrome.tabs.create({ url: url, active: active });
    console.log(`✅ 创建新标签页成功:`, tab);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'create_tab', status: 'success', details: { tab: { id: tab.id, url: tab.url, active: tab.active, windowId: tab.windowId } } }));
    }
    return tab;
  } catch (error) {
    console.error(`❌ 创建新标签页失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'create_tab', status: 'error', details: { url: url, active: active, error: error.message } }));
    }
  }
  return null;
}

// 聚焦标签页
async function focusTab(tabId) {
  try {
    console.log(`🎯 聚焦标签页 ID: ${tabId}`);
    // 首先需要激活包含该标签页的窗口
    const tab = await chrome.tabs.get(tabId);
    await chrome.windows.update(tab.windowId, { focused: true });
    // 然后激活标签页
    const updatedTab = await chrome.tabs.update(tabId, { active: true });
    console.log(`✅ 聚焦标签页成功:`, updatedTab);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'focus_tab', status: 'success', details: { tabId: tabId } }));
    }
    return updatedTab;
  } catch (error) {
    console.error(`❌ 聚焦标签页 ${tabId} 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'focus_tab', status: 'error', details: { tabId: tabId, error: error.message } }));
    }
  }
  return null;
}

// --- Window Management ---

// 创建新窗口
async function createWindow(url, focused = true, type = 'normal', state = 'normal') {
  try {
    console.log(`🖼️ 创建新窗口: url=${url || '默认'}, focused=${focused}, type=${type}, state=${state}`);
    const windowInfo = await chrome.windows.create({ url: url, focused: focused, type: type, state: state });
    console.log(`✅ 创建新窗口成功:`, windowInfo);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'create_window', status: 'success', details: { window: windowInfo } }));
    }
    return windowInfo;
  } catch (error) {
    console.error(`❌ 创建新窗口失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'create_window', status: 'error', details: { error: error.message } }));
    }
  }
  return null;
}

// 关闭窗口
async function closeWindow(windowId) {
  try {
    console.log(`🖼️ 关闭窗口 ID: ${windowId}`);
    await chrome.windows.remove(windowId);
    console.log(`✅ 关闭窗口命令已发送`);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'close_window', status: 'success', details: { windowId: windowId } }));
    }
  } catch (error) {
    console.error(`❌ 关闭窗口 ${windowId} 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'close_window', status: 'error', details: { windowId: windowId, error: error.message } }));
    }
  }
}

// 获取所有窗口信息
async function getAllWindows(populate = false) { // populate: 是否包含标签页信息
  try {
    console.log(`🖼️ 获取所有窗口信息 (populate=${populate})`);
    const windows = await chrome.windows.getAll({ populate: populate });
    console.log(`✅ 获取所有窗口成功:`, windows);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_all_windows', status: 'success', details: { windows: windows } }));
    }
    return windows;
  } catch (error) {
    console.error(`❌ 获取所有窗口失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'get_all_windows', status: 'error', details: { error: error.message } }));
    }
  }
  return null;
}

// 聚焦窗口
async function focusWindow(windowId) {
  try {
    console.log(`🎯 聚焦窗口 ID: ${windowId}`);
    const updatedWindow = await chrome.windows.update(windowId, { focused: true });
    console.log(`✅ 聚焦窗口成功:`, updatedWindow);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'focus_window', status: 'success', details: { windowId: windowId } }));
    }
    return updatedWindow;
  } catch (error) {
    console.error(`❌ 聚焦窗口 ${windowId} 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'focus_window', status: 'error', details: { windowId: windowId, error: error.message } }));
    }
  }
  return null;
}

// --- History Management ---
// 需要 'history' 权限

// 搜索历史记录
async function searchHistory(query) { // query is an object like {text: 'example', maxResults: 10}
  try {
    console.log(`📜 搜索历史记录:`, query);
    const historyItems = await chrome.history.search(query);
    console.log(`✅ 搜索历史记录成功:`, historyItems);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'search_history', status: 'success', details: { historyItems: historyItems } }));
    }
    return historyItems;
  } catch (error) {
    console.error(`❌ 搜索历史记录失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'search_history', status: 'error', details: { query: query, error: error.message } }));
    }
  }
  return null;
}

// 删除指定 URL 的历史记录
async function deleteHistoryUrl(url) {
  try {
    console.log(`📜 删除历史记录 URL: ${url}`);
    await chrome.history.deleteUrl({ url: url });
    console.log(`✅ 删除历史记录 URL 命令已发送`);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'delete_history_url', status: 'success', details: { url: url } }));
    }
  } catch (error) {
    console.error(`❌ 删除历史记录 URL ${url} 失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'delete_history_url', status: 'error', details: { url: url, error: error.message } }));
    }
  }
}

// --- Bookmark Management ---
// 需要 'bookmarks' 权限

// 创建书签
async function createBookmark(url, title, parentId) {
  try {
    const bookmarkDetails = { url: url };
    if (title) bookmarkDetails.title = title;
    if (parentId) bookmarkDetails.parentId = parentId; // 默认为 '书签栏'
    console.log(`⭐ 创建书签:`, bookmarkDetails);
    const bookmarkNode = await chrome.bookmarks.create(bookmarkDetails);
    console.log(`✅ 创建书签成功:`, bookmarkNode);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'create_bookmark', status: 'success', details: { bookmark: bookmarkNode } }));
    }
    return bookmarkNode;
  } catch (error) {
    console.error(`❌ 创建书签失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'create_bookmark', status: 'error', details: { url: url, title: title, parentId: parentId, error: error.message } }));
    }
  }
  return null;
}

// 搜索书签
async function searchBookmarks(query) { // query can be a string or an object {query: '...', url: '...', title: '...'}
  try {
    console.log(`⭐ 搜索书签:`, query);
    const bookmarkNodes = await chrome.bookmarks.search(query);
    console.log(`✅ 搜索书签成功:`, bookmarkNodes);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'search_bookmarks', status: 'success', details: { bookmarks: bookmarkNodes } }));
    }
    return bookmarkNodes;
  } catch (error) {
    console.error(`❌ 搜索书签失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'search_bookmarks', status: 'error', details: { query: query, error: error.message } }));
    }
  }
  return null;
}

// --- Browsing Data ---
// 需要 'browsingData' 权限

// 清除浏览数据
async function clearBrowsingData(dataTypes, options = {}) { // dataTypes is an object like {cookies: true, history: true}, options like {since: 0}
  try {
    console.log(`🧹 清除浏览数据: types=${Object.keys(dataTypes).filter(k => dataTypes[k]).join(', ')}, options=`, options);
    await chrome.browsingData.remove(options, dataTypes);
    console.log(`✅ 清除浏览数据命令已发送`);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'clear_browsing_data', status: 'success', details: { dataTypes: dataTypes, options: options } }));
    }
  } catch (error) {
    console.error(`❌ 清除浏览数据失败:`, error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action_result', originalType: 'clear_browsing_data', status: 'error', details: { dataTypes: dataTypes, options: options, error: error.message } }));
    }
  }
}


// --- 初始化 ---

// 启动 WebSocket 连接
connectWebSocket();

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background script:", request, "from sender:", sender);

  // Example: Relay message or handle background tasks
  if (request.type === "page_loaded") {
    console.log(`Content script reported page loaded: ${request.url} - ${request.title}`);
    // Optionally do something with this info, like updating extension state
    sendResponse({ status: "received", info: `Page loaded: ${request.title}` });
  } else if (request.action) {
      // If a content script sends an action message here, decide how to handle it.
      // For now, just acknowledge.
      console.log(`Received action '${request.action}' from content script.`);
      sendResponse({ status: "acknowledged", action: request.action });
  }
  else {
    // Handle other message types if needed
    sendResponse({ status: "unknown_message_type" });
  }

  // Return true to indicate you wish to send a response asynchronously
  return true;
});

// Example: Listen for commands defined in manifest.json (if any)
// 由于 manifest.json 中未定义 commands，暂时注释掉此监听器以避免错误
// chrome.commands.onCommand.addListener((command) => {
//   console.log(`Command received: ${command}`);
//   // Handle commands like opening popup or triggering actions
// });

// Example: Handling installation or update events
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Extension installed.");
    // Perform first-time setup if needed
  } else if (details.reason === "update") {
    const previousVersion = details.previousVersion;
    console.log(`Extension updated from ${previousVersion} to ${chrome.runtime.getManifest().version}.`);
    // Handle migration if needed
  }
});

// Function to send messages to content script (example)
async function sendMessageToActiveTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, message);
      console.log("Response from content script:", response);
      return response;
    } catch (error) {
      console.error("Could not send message to content script:", error);
      // This often happens if the content script isn't injected or the tab is protected (e.g., chrome:// pages)
      return { status: "error", message: error.message };
    }
  } else {
      console.log("No active tab found to send message to.");
      return { status: "error", message: "No active tab" };
  }
}

// Example usage of sending message (e.g., triggered by popup or command)
// setTimeout(() => {
//   sendMessageToActiveTab({ action: "getStatus" });
// }, 5000); // Send message 5 seconds after background script loads

// 保持 Service Worker 活跃 (Manifest V3)
// 可以通过定期发送消息或使用 chrome.alarms API
// chrome.alarms.create('keepAlive', { periodInMinutes: 4.9 });
// chrome.alarms.onAlarm.addListener(alarm => {
//   if (alarm.name === 'keepAlive') {
//     console.log('Keep-alive alarm triggered');
//     // 可以执行一些轻量级操作，如检查连接状态
//     if (!ws || ws.readyState !== WebSocket.OPEN) {
//       console.log('WebSocket 未连接，尝试重连...');
//       // 确保不会在 onclose 的 setTimeout 之外重复调用 connectWebSocket
//       // 可能需要更复杂的逻辑来管理重连状态
//     }
//   }
// });