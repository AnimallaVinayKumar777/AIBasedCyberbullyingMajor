import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.home": "Home",
      "nav.profile": "Profile",
      "nav.notifications": "Notifications",
      "nav.explore": "Explore",
      "nav.login": "Login",

      // Common actions
      "common.post": "Post",
      "common.comment": "Comment",
      "common.like": "Like",
      "common.share": "Share",
      "common.search": "Search",

      // Sidebar
      "sidebar.trending": "Trending",
      "sidebar.who_to_follow": "Who to follow",
      "common.follow": "Follow",
      "common.following": "Following",
      "common.unfollow": "Unfollow",
      "common.edit": "Edit",
      "common.delete": "Delete",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.confirm": "Confirm",
      "common.close": "Close",
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",

      // Authentication
      "auth.login": "Login",
      "auth.logout": "Logout",
      "auth.username": "Username",
      "auth.password": "Password",
      "auth.email": "Email",
      "auth.signin": "Sign In",
      "auth.signup": "Sign Up",

      // Posts
      "post.create": "Create Post",
      "post.title": "Title",
      "post.content": "Content",
      "post.image": "Image",
      "post.likes": "Likes",
      "post.comments": "Comments",
      "post.shares": "Shares",

      // Profile
      "profile.followers": "Followers",
      "profile.following": "Following",
      "profile.posts": "Posts",
      "profile.bio": "Bio",
      "profile.edit_profile": "Edit Profile",

      // Notifications
      "notifications.title": "Notifications",
      "notifications.mark_all_read": "Mark all as read",
      "notifications.no_notifications": "No notifications",

      // Settings
      "settings.language": "Language",
      "settings.theme": "Theme",
      "settings.light": "Light",
      "settings.dark": "Dark",
      "settings.system": "System",

      // Messages
      "message.welcome": "Welcome to SafeNet",
      "message.post_created": "Post created successfully",
      "message.post_deleted": "Post deleted successfully",
      "message.login_success": "Login successful",
      "message.login_failed": "Login failed",
    }
  },
  es: {
    translation: {
      // Navigation
      "nav.home": "Inicio",
      "nav.profile": "Perfil",
      "nav.notifications": "Notificaciones",
      "nav.explore": "Explorar",
      "nav.login": "Iniciar Sesión",

      // Common actions
      "common.post": "Publicar",
      "common.comment": "Comentar",
      "common.like": "Me gusta",
      "common.share": "Compartir",
      "common.search": "Buscar",

      // Sidebar
      "sidebar.trending": "Tendencias",
      "sidebar.who_to_follow": "A quién seguir",
      "common.follow": "Seguir",
      "common.following": "Siguiendo",
      "common.unfollow": "Dejar de seguir",
      "common.edit": "Editar",
      "common.delete": "Eliminar",
      "common.save": "Guardar",
      "common.cancel": "Cancelar",
      "common.confirm": "Confirmar",
      "common.close": "Cerrar",
      "common.loading": "Cargando...",
      "common.error": "Error",
      "common.success": "Éxito",

      // Authentication
      "auth.login": "Iniciar Sesión",
      "auth.logout": "Cerrar Sesión",
      "auth.username": "Usuario",
      "auth.password": "Contraseña",
      "auth.email": "Correo",
      "auth.signin": "Iniciar Sesión",
      "auth.signup": "Registrarse",

      // Posts
      "post.create": "Crear Publicación",
      "post.title": "Título",
      "post.content": "Contenido",
      "post.image": "Imagen",
      "post.likes": "Me gusta",
      "post.comments": "Comentarios",
      "post.shares": "Compartidos",

      // Profile
      "profile.followers": "Seguidores",
      "profile.following": "Siguiendo",
      "profile.posts": "Publicaciones",
      "profile.bio": "Biografía",
      "profile.edit_profile": "Editar Perfil",

      // Notifications
      "notifications.title": "Notificaciones",
      "notifications.mark_all_read": "Marcar todas como leídas",
      "notifications.no_notifications": "No hay notificaciones",

      // Settings
      "settings.language": "Idioma",
      "settings.theme": "Tema",
      "settings.light": "Claro",
      "settings.dark": "Oscuro",
      "settings.system": "Sistema",

      // Messages
      "message.welcome": "Bienvenido a SafeNet",
      "message.post_created": "Publicación creada exitosamente",
      "message.post_deleted": "Publicación eliminada exitosamente",
      "message.login_success": "Inicio de sesión exitoso",
      "message.login_failed": "Error en el inicio de sesión",
    }
  },
  fr: {
    translation: {
      // Navigation
      "nav.home": "Accueil",
      "nav.profile": "Profil",
      "nav.notifications": "Notifications",
      "nav.explore": "Explorer",
      "nav.login": "Connexion",

      // Common actions
      "common.post": "Publier",
      "common.comment": "Commenter",
      "common.like": "J'aime",
      "common.share": "Partager",
      "common.search": "Rechercher",

      // Sidebar
      "sidebar.trending": "Tendances",
      "sidebar.who_to_follow": "Qui suivre",
      "common.follow": "Suivre",
      "common.following": "Abonné",
      "common.unfollow": "Ne plus suivre",
      "common.edit": "Modifier",
      "common.delete": "Supprimer",
      "common.save": "Enregistrer",
      "common.cancel": "Annuler",
      "common.confirm": "Confirmer",
      "common.close": "Fermer",
      "common.loading": "Chargement...",
      "common.error": "Erreur",
      "common.success": "Succès",

      // Authentication
      "auth.login": "Connexion",
      "auth.logout": "Déconnexion",
      "auth.username": "Nom d'utilisateur",
      "auth.password": "Mot de passe",
      "auth.email": "Email",
      "auth.signin": "Se connecter",
      "auth.signup": "S'inscrire",

      // Posts
      "post.create": "Créer une publication",
      "post.title": "Titre",
      "post.content": "Contenu",
      "post.image": "Image",
      "post.likes": "J'aime",
      "post.comments": "Commentaires",
      "post.shares": "Partages",

      // Profile
      "profile.followers": "Abonnés",
      "profile.following": "Abonnements",
      "profile.posts": "Publications",
      "profile.bio": "Biographie",
      "profile.edit_profile": "Modifier le profil",

      // Notifications
      "notifications.title": "Notifications",
      "notifications.mark_all_read": "Marquer tout comme lu",
      "notifications.no_notifications": "Aucune notification",

      // Settings
      "settings.language": "Langue",
      "settings.theme": "Thème",
      "settings.light": "Clair",
      "settings.dark": "Sombre",
      "settings.system": "Système",

      // Messages
      "message.welcome": "Bienvenue sur SafeNet",
      "message.post_created": "Publication créée avec succès",
      "message.post_deleted": "Publication supprimée avec succès",
      "message.login_success": "Connexion réussie",
      "message.login_failed": "Échec de la connexion",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;