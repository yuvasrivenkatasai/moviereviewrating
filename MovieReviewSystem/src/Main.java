
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Main {

    // Change this to 8081 if port 8080 is already in use.
    private static final int PORT = 8081;

    private static final String PUBLIC_FOLDER = "public";

    public static void main(String[] args) {

        try {
            HttpServer server = HttpServer.create(
                new InetSocketAddress(PORT), 0
            );

            server.createContext("/", Main::handleRequest);

            server.setExecutor(null);

            server.start();

            System.out.println("------------------------------------");
            System.out.println("   MOVIE REVIEW AND RATING SYSTEM");
            System.out.println("------------------------------------");
            System.out.println("Server started successfully!");
            System.out.println("Open Chrome and visit:");
            System.out.println("http://localhost:" + PORT);
            System.out.println("------------------------------------");

        } catch (IOException e) {

            System.out.println("Unable to start the server.");
            System.out.println("Reason: " + e.getMessage());

            if (e instanceof java.net.BindException) {
                System.out.println(
                    "Port " + PORT + " is already in use."
                );
                System.out.println(
                    "Change PORT to 8082 and run the program again."
                );
            }
        }
    }

    private static void handleRequest(HttpExchange exchange) {

        try {
            String requestPath = exchange.getRequestURI().getPath();

            if (requestPath == null || requestPath.equals("/")) {
                requestPath = "/index.html";
            }

            // Prevent access outside the public folder.
            String decodedPath = URLDecoder.decode(
                requestPath, StandardCharsets.UTF_8
            );

            if (decodedPath.contains("..") || decodedPath.contains("\\")) {
                sendResponse(
                    exchange,
                    403,
                    "text/plain; charset=UTF-8",
                    "403 - Forbidden"
                );
                return;
            }

            Path basePath = Paths.get(PUBLIC_FOLDER)
                                 .toAbsolutePath()
                                 .normalize();

            Path filePath = basePath.resolve(
                decodedPath.substring(1)
            ).normalize();

            if (!filePath.startsWith(basePath)) {
                sendResponse(
                    exchange,
                    403,
                    "text/plain; charset=UTF-8",
                    "403 - Forbidden"
                );
                return;
            }

            if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
                sendResponse(
                    exchange,
                    404,
                    "text/plain; charset=UTF-8",
                    "404 - File Not Found"
                );
                return;
            }

            String contentType = getContentType(filePath);

            byte[] fileBytes = Files.readAllBytes(filePath);

            exchange.getResponseHeaders().set(
                "Content-Type", contentType
            );

            exchange.getResponseHeaders().set(
                "Cache-Control", "no-cache"
            );

            exchange.sendResponseHeaders(200, fileBytes.length);

            try (OutputStream output = exchange.getResponseBody()) {
                output.write(fileBytes);
            }

        } catch (Exception e) {

            try {
                sendResponse(
                    exchange,
                    500,
                    "text/plain; charset=UTF-8",
                    "500 - Internal Server Error"
                );
            } catch (IOException ignored) {
                System.out.println("Request error: " + e.getMessage());
            }
        }
    }

    private static String getContentType(Path filePath) {

        String fileName = filePath.getFileName()
                                  .toString()
                                  .toLowerCase();

        if (fileName.endsWith(".html")) {
            return "text/html; charset=UTF-8";
        }

        if (fileName.endsWith(".css")) {
            return "text/css; charset=UTF-8";
        }

        if (fileName.endsWith(".js")) {
            return "application/javascript; charset=UTF-8";
        }

        if (fileName.endsWith(".json")) {
            return "application/json; charset=UTF-8";
        }

        if (fileName.endsWith(".png")) {
            return "image/png";
        }

        if (fileName.endsWith(".jpg") ||
            fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        }

        if (fileName.endsWith(".svg")) {
            return "image/svg+xml";
        }

        if (fileName.endsWith(".ico")) {
            return "image/x-icon";
        }

        return "application/octet-stream";
    }

    private static void sendResponse(
        HttpExchange exchange,
        int statusCode,
        String contentType,
        String message
    ) throws IOException {

        byte[] response = message.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set(
            "Content-Type", contentType
        );

        exchange.sendResponseHeaders(statusCode, response.length);

        try (OutputStream output = exchange.getResponseBody()) {
            output.write(response);
        }
    }
}
