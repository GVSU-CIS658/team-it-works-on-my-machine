import { defineStore } from 'pinia'
import { filterInputAttrs } from 'vuetify/lib/util/helpers.mjs';


type Task = {
    id: number,
    description: string;
    date: Date;
    isCompleted: boolean;
    isHidden: boolean;
}

enum filterOption {
    All,
    Finished,
    Unfinished,
    Sooner,
    Later
}


export const DashboardTask = defineStore("DashboardTask", {
    state: () => ({
        tasks: [] as Task[],
        filteredTasks: [] as Task[],
        myFilter: filterOption.All,

    }),
    actions: {
        addTask(task: string, id: number) {
            if (task == "") return;
            this.tasks.push({
                id,
                description: task,
                isCompleted: false,
                isHidden: false,
                date: new Date(),
            })
            this.tasks.sort((a, b) => b.date.getDate() - a.date.getDate());
            // this.filterTask(this.hideFilter);
            console.log(this.tasks);
        },
        addTestTask(task: Task) {
            this.tasks.push(task);
            this.tasks.sort((a, b) => b.date.getDate() - a.date.getDate());
            // this.filterTask(this.hideFilter);
        },
        updateTask() { },

        filterTask() {
        }
    },
});

export type { Task }
