package ma.usmba.translator.api;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ma.usmba.translator.service.LLMClient;

@Path("/translator")
public class TranslatorResource {

    private final LLMClient llmClient = new LLMClient();

    /**
     * Méthode métier pour traduire un texte.
     * Prend un texte anglais en argument et retourne sa traduction en Darija.
     */
    @POST
    @Path("/translate")
    @Consumes(MediaType.TEXT_PLAIN)
    @Produces(MediaType.TEXT_PLAIN)
    public Response translate(String englishText) {

        if (englishText == null || englishText.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Le texte à traduire ne peut pas être vide.")
                    .build();
        }

        try {
            // Appel au LLM ( Google Gemini) pour effectuer la traduction
            String translation = llmClient.callLLM(englishText);

            return Response.ok(translation).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur lors de la traduction : " + e.getMessage())
                    .build();
        }
    }
}
