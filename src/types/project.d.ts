declare interface IProject {
  gid: string;
  resource_type: "project";
  name: string;
}

declare interface IGetProjectOptions {
  workspace: string;
}
