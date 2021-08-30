import { AxiosInstance } from "axios";
import axios from "./axios";

/**
 * @class Asana API Manager
 */
class AsanaClient {
  static _instance: AsanaClient;

  /**
   * Create AsanaClient Instance
   *
   * @param token
   * @returns
   */
  static create = (): AsanaClient => {
    if (!AsanaClient._instance) {
      AsanaClient._instance = new AsanaClient();
    }
    return AsanaClient._instance;
  };

  setToken = (token) => {
    this.axiosIns = axios(token);
  };

  axiosIns: AxiosInstance;
  constructor() {}

  /**
   * When authentication failed
   *
   * @param callBack
   * @returns
   */
  reAuth = async (callBack) => {
    const authData = await aha.auth("asana", {});
    this.setToken(authData.token);
    return await callBack();
  };

  /**
   * Get Projects from Asana
   *
   * @param options
   * @returns
   */
  getProjects = async (options: IGetProjectOptions): Promise<IProject[]> => {
    try {
      const {
        data: { data },
      } = await this.axiosIns.get("/projects", { params: options });
      return data;
    } catch (error) {
      this.log("Could not get Projects", error);
      return await this.reAuth(async () => await this.getProjects(options));
    }
  };

  /**
   * Get Workspaces from Asana
   *
   * @returns
   */
  getWorkSpaces = async (): Promise<IWorkSpace[]> => {
    try {
      const {
        data: { data },
      } = await this.axiosIns.get("/workspaces");
      return data;
    } catch (error) {
      this.log("Could not get Workspaces", error);
      return await this.reAuth(async () => await this.getWorkSpaces());
    }
  };

  /**
   * Get Users from Asana
   *
   * @param options
   * @returns
   */
  getUsers = async (options: IGetUserOptions): Promise<IUser[]> => {
    try {
      const {
        data: { data },
      } = await this.axiosIns.get("/users", { params: options });
      return data;
    } catch (error) {
      this.log("Could not get Users", error);
      return [];
    }
  };

  /**
   * Get Tasks from Asana
   *
   * @param options
   * @returns
   */
  getTasks = async (options: IGetTaskOptions): Promise<{ data: ITaskCompact[]; next_page: string | null }> => {
    try {
      const axiosIns = this.axiosIns;
      const {
        data: { data, next_page },
      } = await axiosIns.get("/tasks", { params: { ...options } });

      const results = (await Promise.allSettled(data.map(({ gid }) => this.axiosIns.get(`/tasks/${gid}`)))) as any;
      const tasks = results
        .filter(({ status }) => {
          return status === "fulfilled";
        })
        .map(({ value }) => {
          return value?.data?.data || {};
        });

      return { data: tasks, next_page };
    } catch (error) {
      this.log("Could not get Tasks", error);
      return await this.reAuth(async () => await this.getTasks(options));
    }
  };

  /**
   * Error Log
   *
   * @param msg
   * @param error
   */
  log = (msg, error) => {
    console.log(`[Error in Asana API Call] => `, msg, error);
  };
}

export default AsanaClient.create();
