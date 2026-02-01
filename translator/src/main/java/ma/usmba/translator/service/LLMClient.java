package ma.usmba.translator.service;

import java.net.URI;
import java.net.http.*;

public class LLMClient {
    // Utilisation de Groq (Gratuit et Rapide)
    private static final String URL = "https://api.groq.com/openai/v1/chat/completions";

    // Ancien comportement: clé API en dur dans le code
    private static final String API_KEY = "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";

    public String callLLM(String text) throws Exception {

        // Préparation du JSON pour Llama 3.3
        String jsonPayload = """
    {
      "model": "openai/gpt-oss-120b",
      "messages": [
        {
          "role": "system", 
          "content": "Tu es un traducteur expert en Darija Marocain. Traduis UNIQUEMENT en Darija (alphabet arabe). Interdiction d'utiliser l'arabe classique ou des caractères latins. Pas d'explications."
        },
        {"role": "user", "content": "%s"}
      ]
    }
    """.formatted(text.replace("\"", "\\\""));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(URL))
                .header("Authorization", "Bearer " + API_KEY)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        // Envoi de la requête
        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        return extract(response.body());
    }

    private String extract(String json) {
        try {

            String key = "\"content\":\"";
            int start = json.indexOf(key) + key.length();
            int end = json.indexOf("\"", start);

            if (start < key.length() || end == -1) return "Erreur d'extraction";

            String result = json.substring(start, end);

            // Décodage des sauts de ligne et des guillemets
            return result.replace("\\n", "\n").replace("\\\"", "\"");
        } catch (Exception e) {
            return "Erreur d'extraction : " + e.getMessage();
        }
    }
}