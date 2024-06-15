import {
  ProjectStorage,
  Project,
  ProjectFile,
  SimulationState,
  StymulusConfig,
} from "./projectSystem";

import { toast } from "vue-sonner";

export class ToastMessage {
  title: string;
  text?: string;
  type: "warning" | "error" | "success" | "info" = "info";
  buttonText?: string;
  buttonCallback?: Function;
}

export class IDEState {
  activeScreen: "vhdl" | "stymulus" | "waveform" = "vhdl";
  activeProject?: Project;
  activeFile?: ProjectFile;
  editorLine?: number;
  activeProjectNeedsRecompilation: boolean = true;
  projectStorage: ProjectStorage;
  stymulusState?: StymulusConfig;
  simulationState?: SimulationState;

  constructor() {}

  saveToLocalStorage() {
    this.projectStorage.saveAll();
    localStorage.setItem(
      "IDEState",
      JSON.stringify({
        activeScreen: this.activeScreen,
        activeProjectName: this.activeProject ? this.activeProject.name : "",
        activeFileName: this.activeFile ? this.activeFile.name : "",
        editorLine: this.editorLine ?? 0,
      })
    );
  }
  static loadFromLocalStorage(): IDEState {
    const ide_state: IDEState = new IDEState();
    ide_state.projectStorage = ProjectStorage.loadFromLocalStorage();
    const data = JSON.parse(localStorage.getItem("IDEState") || "{}");

    if (data.activeProjectName) {
      ide_state.activeProject = ide_state.projectStorage.getProjectByName(
        data.activeProjectName
      );
      if (data.activeFileName) {
        ide_state.activeFile = ide_state.activeProject.getFileByName(
          data.activeFileName
        );
        ide_state.editorLine = data.editorLine ?? 0;
      }
    }
    return ide_state;
  }
  setProjectActive(projectName: string) {
    this.activeProject = this.projectStorage.getProjectByName(projectName);
    this.simulationState = SimulationState.loadFromLocalStorage(
      this.projectStorage,
      projectName
    );
    this.stymulusState = StymulusConfig.loadFromLocalStorage(
      this.projectStorage,
      projectName
    );
  }
  addToastMessage(message: ToastMessage) {
    const data: any = {};
    if (message.text) data.description = message.text;
    if (message.buttonText) {
      data.action = {
        label: message.buttonText,
        callback: message.buttonCallback,
      };
    }
    if (message.type == "error") {
      toast.error(message.title, data);
    } else if (message.type == "success") {
      toast.success(message.title, data);
    } else if (message.type == "warning") {
      toast.warning(message.title, data);
    } else {
      toast.info(message.title, data);
    }
  }
}
