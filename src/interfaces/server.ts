import * as Hapi from "@hapi/hapi";
import { PluginInterface as ServicesPluginInterface } from "../plugins/services";

export interface ICredentials extends Hapi.AuthCredentials {
  userId: string;
}

export interface IRequestAuth extends Hapi.RequestAuth {
  credentials: ICredentials;
}

export interface IServer extends Hapi.Server {
  plugins: IExtendedPluginProperties;
}

export interface IRequest extends Hapi.Request {
  auth: IRequestAuth;
  server: IServer;
}

export interface IExtendedPluginProperties
  extends Hapi.PluginProperties,
    ServicesPluginInterface {}

export interface IRequest extends Hapi.Request {}

export interface IServer extends Hapi.Server {
  plugins: IExtendedPluginProperties;
  request: IRequest;
}
