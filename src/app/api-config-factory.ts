import {environment} from "../environments/environment";
import {AuthService} from "./auth/auth.service";
import {Configuration, ConfigurationParameters} from "./api";

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    apiKeys: {},
    accessToken: () => {
      let token = AuthService.getAccessToken();

      if (!token) {
        throw new Error('Пользователь не авторизован');
      }

      return token;
    },
    basePath: environment.baseApiUrl
  };
  return new Configuration(params);
}
