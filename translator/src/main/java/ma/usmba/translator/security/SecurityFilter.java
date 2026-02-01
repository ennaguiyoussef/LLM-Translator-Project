package ma.usmba.translator.security;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import jakarta.ws.rs.core.Response;
import java.util.Base64;

/**
 * Filtre pour implémenter la "Basic Authentication" demandée.
 */
@Provider
public class SecurityFilter implements ContainerRequestFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) {
        String authHeader = requestContext.getHeaderString("Authorization");

        if (authHeader == null || !authHeader.startsWith("Basic ")) {
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                    .header("WWW-Authenticate", "Basic realm=\"Translator\"").build());
            return;
        }

        // Logique simplifiée de vérification (User: admin / Pass: password).
        String base64Credentials = authHeader.substring("Basic ".length()).trim();
        byte[] credDecoded = Base64.getDecoder().decode(base64Credentials);
        String credentials = new String(credDecoded);

        if (!credentials.equals("admin:password")) {
            requestContext.abortWith(Response.status(Response.Status.FORBIDDEN).build());
        }
    }
}
