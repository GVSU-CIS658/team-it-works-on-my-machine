import { defineStore } from 'pinia'
import { filterInputAttrs } from 'vuetify/lib/util/helpers.mjs';


type Task = {
    id: number,
    description: string;
    date: Date;
    isCompleted: boolean;
    isHidden: boolean;
}

type HideFilter = {
    hideCompleted: boolean
}

export const DashboardTask = defineStore("DashboardTask", {
    state: () => ({
        tasks: [] as Task[],
        filteredTasks: [] as Task[],
        hideFilter: false,
    }),
    actions: {
        addTask(task: string, id: number) {

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

        filterTask(hideFilter: boolean) {
            this.hideFilter = hideFilter;
            this.filteredTasks = this.tasks;
            console.log(this.filteredTasks);
            if (this.hideFilter) {
                this.filteredTasks = this.tasks.filter(x => x.isCompleted);
            } else {
                this.filteredTasks = this.tasks;
            }

        }
    },
});

export type { Task }
