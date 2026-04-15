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
    querySnapshotFromJSON,
    deleteDoc,
    doc
} from "firebase/firestore";
import { User } from "firebase/auth"
import { stringConcat } from 'firebase/firestore/pipelines';


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
    NONE: 'none',
    DATE: 'date',
    ALPHABET: 'alphabet',
});

const user = "";

type TaskFilterOption = typeof TASK_FILTER_OPTIONS[keyof typeof TASK_FILTER_OPTIONS];
type TaskSortOption = typeof TASK_SORT_OPTIONS[keyof typeof TASK_SORT_OPTIONS];


export const DashboardTask = defineStore("DashboardTask", {
    state: () => ({
        user: user,
        tasks: [] as Task[],
        filteredTasks: [] as Task[],
        myFilter: TASK_FILTER_OPTIONS.ALL as TaskFilterOption,
        unsubscribe: null as any,


    }),
    actions: {
        init(user: string) {
            this.user = user;
            if (this.tasks.length > 0) return;
            const myTasks = collection(db, "Tasks");

            const taskQuery = query(myTasks, where("user", "==", this.user));

            this.unsubscribe = onSnapshot(taskQuery, (qs: QuerySnapshot) => {
                this.tasks = [];
                getDocs(taskQuery).then((qs: QuerySnapshot) => {
                    qs.forEach((qd: QueryDocumentSnapshot) => {
                        const data = qd.data() as Task;
                        data.date = new Date(data.date);
                        this.tasks.push(data);
                    })
                });
            });
            this.filterTask(TASK_FILTER_OPTIONS.ALL);

        },
        addTask(task: string, id: number) {
            if (task == "") return;
            const newTask = {
                user: this.user,
                id,
                description: task,
                isCompleted: false,
                isHidden: false,
                date: new Date(),
            }

            const myTasks = collection(db, "Tasks");
            addDoc(myTasks, { ...newTask, date: newTask.date.toString() });
            this.tasks.splice(0, 0, newTask);
            //this.filterTask(TASK_FILTER_OPTIONS.ALL);
        },
        updateTask(id: number, user: string) {

        },

        deleteTask(id: number, user: string) {
            const myTasks = collection(db, "Tasks");
            const q1 = where("id", "==", id);
            const q2 = where("user", "==", user);
            const qr = query(myTasks, q1, q2);
            getDocs(qr).then((qs: QuerySnapshot) => {
                qs.forEach(async (qd: QueryDocumentSnapshot) => {
                    const myDoc = doc(db, "Tasks/" + qd.id);
                    await deleteDoc(myDoc);
                })
            })
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
