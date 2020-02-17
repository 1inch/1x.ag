import { newJob} from "./cron";

const job = newJob( () => {
    console.log('test')
});

job.start();

