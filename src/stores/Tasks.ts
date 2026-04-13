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

enum filterOption {
    All,
    Finished,
    Unfinished,
    Sooner,
    Later,
    Alphabet,
}


export const DashboardTask = defineStore("DashboardTask", {
    state: () => ({
        tasks: [] as Task[],
        filteredTasks: [] as Task[],
        myFilter: filterOption.All,

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
            this.filterTask(filterOption.Alphabet);

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
            this.filterTask(filterOption.Alphabet);
        },
        updateTask(id: number, user: string) {

        },

        filterTask(option: filterOption) {
            this.myFilter = option;
            switch (this.myFilter) {
                case filterOption.Sooner:

                    this.tasks.sort((a, b) => b.date.getDate() - a.date.getDate());
                    break;

                case filterOption.Alphabet:
                    console.log("neat");
                    this.tasks.sort((a, b) => {
                        if (a.description.toUpperCase() > b.description.toUpperCase()) {
                            return 1;
                        }
                        if (a.description.toUpperCase() < b.description.toUpperCase()) {
                            return -1;
                        }
                        return 0;
                    })
                        ;
                    break;
                default:
                    this.tasks.sort((a, b) => b.date.getDate() - a.date.getDate());
                    break;
            }

            //   this.tasks.sort((a, b) => b.date.getDate() - a.date.getDate());
        }
    },
});

export { filterOption }

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
