package ma.usmba.translator;

import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;
import java.net.URI;

public class Main {
    // L'URL où votre service sera publié
    public static final String BASE_URI = "http://localhost:8080/api/";

    public static void main(String[] args) {
        // Scanner le package pour trouver TranslatorResource et SecurityFilter
        final ResourceConfig rc = new ResourceConfig().packages("ma.usmba.translator.api", "ma.usmba.translator.security");

        // Démarrer le serveur
        final HttpServer server = GrizzlyHttpServerFactory.createHttpServer(URI.create(BASE_URI), rc);

        System.out.printf("Web Service publié sur %s\nAppuyez sur Entrée pour l'arrêter...%n", BASE_URI);
    }
}
