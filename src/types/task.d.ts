declare interface ITaskCompact extends Aha.ImportRecord {
  gid: string;
  resource_type: "task";
  name: string;
}

declare interface ITask extends ITaskCompact {
  approval_status?: string;
  assignee_status?: string;
  completed?: boolean;
  completed_at?: string;
  completed_by?: IUser;
  created_at?: string;
  dependencies?: any[];
  dependents?: any[];
  due_at?: string;
  due_on?: string;
  external?: any;
  hearted?: boolean;
  hearts?: any[];
  html_notes?: string;
  is_rendered_as_separator?: boolean;
  liked?: boolean;
  likes?: any[];
  memberships?: any[];
  modified_at?: string;
  notes?: string;
  num_hearts?: number;
  num_likes?: number;
  num_subtasks?: number;
  resource_subtype?: string;
  start_on?: string;
  assignee?: IUser;
  assignee_section?: any;
  custom_fields?: any[];
  followers?: IUser[];
  parent?: any;
  permalink_url?: string;
  projects?: IProject[];
  tags?: any[];
  workspace?: IWorkSpace;
}

declare interface IGetTaskOptions {
  project: string;
  assignee?: string;
  limit?: number;
  offset?: string;
}
