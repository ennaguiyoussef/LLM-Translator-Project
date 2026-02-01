package ma.usmba.translator.api;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

/**
 * Active le service JAX-RS et définit le préfixe de l'URL.
 * Toutes les routes commenceront par /api (ex: /api/translator/translate).
 */
@ApplicationPath("/")
public class JaxRsActivator extends Application {
    // La classe reste vide, elle sert de configuration automatique.
}
