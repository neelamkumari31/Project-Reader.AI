package com.example.repomind.service;

import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GitHubService {

    private final RestTemplate restTemplate = new RestTemplate();

    public String fetchPublicRepoCode(String repoUrl) {
        // Clean URL and extract owner and repository name
        String cleanUrl = repoUrl.replaceAll("/$", "");
        String[] parts = cleanUrl.split("/");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid GitHub URL format.");
        }
        String owner = parts[parts.length - 2];
        String repo = parts[parts.length - 1];

        // Try hitting the 'main' branch first
        String apiUrl = String.format("https://github.com", owner, repo);
        Map<String, Object> response;
        
        try {
            response = restTemplate.getForObject(apiUrl, Map.class);
        } catch (Exception e) {
            // Fallback to 'master' branch if 'main' fails
            apiUrl = String.format("https://github.com", owner, repo);
            response = restTemplate.getForObject(apiUrl, Map.class);
        }

        if (response == null || !response.containsKey("tree")) {
            throw new RuntimeException("Could not read repository structure. Ensure it is public.");
        }

        List<Map<String, Object>> tree = (List<Map<String, Object>>) response.get("tree");
        StringBuilder combinedCodebase = new StringBuilder();

        // Allowed extensions to keep context clean (ignores binaries, images, lockfiles)
        List<String> allowedExtensions = List.of(".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".go", ".json", ".html", ".css");
        List<String> ignoredFiles = List.of("package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock");

        for (Map<String, Object> file : tree) {
            String path = (String) file.get("path");
            String type = (String) file.get("type");
            String blobUrl = (String) file.get("url");

            if ("blob".equals(type) && path != null && matchesExtension(path, allowedExtensions) && !isIgnored(path, ignoredFiles)) {
                try {
                    Map<String, Object> blobResponse = restTemplate.getForObject(blobUrl, Map.class);
                    if (blobResponse != null && blobResponse.containsKey("content")) {
                        String base64Content = ((String) blobResponse.get("content")).replaceAll("\\s", "");
                        byte[] decodedBytes = Base64.getDecoder().decode(base64Content);
                        String fileContent = new String(decodedBytes);

                        combinedCodebase.append(String.format("--- FILE: %s ---\n", path));
                        combinedCodebase.append(fileContent).append("\n\n");
                    }
                } catch (Exception e) {
                    // Skip files that fail to download or decode cleanly
                    continue;
                }
            }
        }

        return combinedCodebase.toString();
    }

    private boolean matchesExtension(String path, List<String> extensions) {
        return extensions.stream().anyMatch(path::endsWith);
    }

    private boolean isIgnored(String path, List<String> ignoredFiles) {
        return ignoredFiles.stream().anyMatch(path::endsWith);
    }
}
