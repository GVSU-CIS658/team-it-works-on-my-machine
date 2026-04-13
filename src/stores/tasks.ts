import { defineStore } from 'pinia';
import db from "../services/firebase";
import {
    collection,
    getDocs,
    addDoc,
    QuerySnapshot,
    QueryDocumentSnapshot,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";
import { User } from "firebase/auth"


type Task = {
    user: string,
    id: number,
    description: string;
    date: Date;
    isCompleted: boolean;
    isHidden: boolean;
}

export const TASK_FILTER_OPTIONS = Object.freeze({
    ALL: 'all',
    FINISHED: 'finished',
    UNFINISHED: 'unfinished',
    SOONER: 'sooner',
    LATER: 'later',
});

export const TASK_SORT_OPTIONS = Object.freeze({
    DATE: 'date',
    ALPHABET: 'alphabet',
});

type TaskFilterOption = typeof TASK_FILTER_OPTIONS[keyof typeof TASK_FILTER_OPTIONS];
type TaskSortOption = typeof TASK_SORT_OPTIONS[keyof typeof TASK_SORT_OPTIONS];


export const DashboardTask = defineStore("DashboardTask", {
    state: () => ({
        tasks: [] as Task[],
        filteredTasks: [] as Task[],
        myFilter: TASK_FILTER_OPTIONS.ALL as TaskFilterOption,

    }),
    actions: {
        init() {
            if (this.tasks.length > 0) return;
            const myTasks = collection(db, "Tasks");


            const taskQuery = query(myTasks, where("user", "==", "test"));
            getDocs(taskQuery).then((qs: QuerySnapshot) => {
                qs.forEach((qd: QueryDocumentSnapshot) => {
                    const data = qd.data() as Task;
                    console.log(data.date);
                    data.date = new Date(data.date);
                    this.tasks.push(data);
                })
            });
            this.filterTask(TASK_FILTER_OPTIONS.ALL);

        },
        addTask(task: string, id: number, user: string) {
            if (task == "") return;
            user = "test";

            const newTask = {
                user,
                id,
                description: task,
                isCompleted: false,
                isHidden: false,
                date: new Date(),
            }

            const myTasks = collection(db, "Tasks");
            addDoc(myTasks, { ...newTask, date: newTask.date.toString() });
            this.tasks.push(newTask);
            this.filterTask(TASK_FILTER_OPTIONS.ALL);
        },
        updateTask(id: number, user: string) {

        },

        filterTask(option: TaskFilterOption) {
            this.myFilter = option;
            switch (this.myFilter) {
                case TASK_FILTER_OPTIONS.SOONER:

                    this.tasks.sort((a, b) => b.date.getDate() - a.date.getDate());
                    break;

                default:
                    this.tasks.sort((a, b) => b.date.getDate() - a.date.getDate());
                    break;
            }

            //   this.tasks.sort((a, b) => b.date.getDate() - a.date.getDate());
        }
    },
});

export type { TaskFilterOption }
export type { TaskSortOption }

export type { Task }


// let testTask: Task[] = [
//                 {
//                     user: "test",
//                     id: 0,
//                     description: "Eat breakfast!",
//                     date: new Date("February 01, 2025"),
//                     isCompleted: false,
//                     isHidden: false,
//                 }
//                 ,
//                 {
//                     user: "test",
//                     id: 1,
//                     description: "Do push Up",
//                     date: new Date("March 01, 2025"),
//                     isCompleted: true,
//                     isHidden: false,
//                 },
//                 {
//                     user: "test",
//                     id: 2,
//                     description: "working",
//                     date: new Date("March 01, 2025"),
//                     isCompleted: true,
//                     isHidden: false,
//                 }
//             ]
//             testTask.forEach(x => { addDoc(myTasks, x) });
