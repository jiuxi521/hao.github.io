---
title: Socket
createTime: 2024/10/24 16:40:00
permalink: /article/zkjxfn5x/
---
1. 套接字（socket）是一个抽象层，应用程序可以通过它发送或接收数据，可对其进行像对文件一样的打开、读写和关闭等操作。
2. **网络套接字是IP地址与端口的组合。**
3. Socket是TCP协议的一种实现
### SocketServer
```java
public class SimpleServer {  
    public static void main(String[] args) {  
        // 创建一个ServerSocket实例，并绑定到本地主机上的特定端口（例如8080）  
        try (ServerSocket serverSocket = new ServerSocket(7027);) {  
            System.out.println("Server is listening on port 7027...");  
            // 循环接受来自客户端的连接请求  
            while (true) {  
                // 每当有新的连接请求到达时，accept()方法会阻塞并返回一个新的Socket对象, 然后你可以通过这个Socket与客户端进行通信  
                Socket clientSocket = serverSocket.accept();  
                // 处理客户端连接的逻辑通常会放到一个单独的线程中运行  
                ClientHandler clientHandler = new ClientHandler(clientSocket);  
                FutureTask<Socket> futureTask = new FutureTask<>(clientHandler);  
                futureTask.run();  
            }  
        } catch (Exception e) {  
            System.err.println("Error in server: " + e.getMessage());  
        }  
    }  
}  
  
class ClientHandler implements Callable<Socket> {  
    private final Socket socket;  
  
    public ClientHandler(Socket socket) {  
        this.socket = socket;  
    }  
  
    @Override  
    public Socket call() throws IOException {  
        InputStream inputStream = socket.getInputStream();  
        try (FileOutputStream fileOutputStream = new FileOutputStream(Files.newFile("F:\\coder\\spring-web\\test.txt"))) {  
            byte[] buf = new byte[1024];  
            int size;  
            while ((size = inputStream.read(buf)) > 0) {  
                fileOutputStream.write(buf, 0, size);  
            }  
        } catch (Exception e) {  
            System.err.println("Error in Thread: " + e.getMessage());  
        }  
        return null;  
    }  
}
```

### SocketClient