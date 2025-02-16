import { PageLayout } from "@/components/Layout/PageLayout";
import { Scribbl } from "@/components/Scribbl";

export default function Home() {
    return (
        <PageLayout title="Doodling Board">
            <Scribbl />
        </PageLayout>
    );
}
