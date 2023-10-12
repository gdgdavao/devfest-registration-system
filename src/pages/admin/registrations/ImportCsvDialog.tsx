import { handleFormServerSideError, useInitialImportCsvMutation } from "@/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

export default function ImportCsvDialog({ children }: { children: ReactNode }) {
    const [open, setIsOpen] = useState(false);
    // TODO: create a separate collection for csv imports
    // const { mutate: importCsv } = useImportCsvMutation();
    const { mutate: initialImportCsv } = useInitialImportCsvMutation();
    const form = useForm();

    return <Dialog open={open} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="lg:max-w-screen-sm overflow-y-scroll max-h-[calc(100vh-2rem)]">
            <DialogHeader>
                <DialogTitle>Import CSV</DialogTitle>

                <Form {...form}>
                    <form className="flex flex-col space-y-2" onSubmit={form.handleSubmit((data) => {
                        initialImportCsv(data.file, {
                            onError(err) {
                                handleFormServerSideError(err, (errors) => {
                                    for (const fieldName in errors) {
                                        form.setError(fieldName as never, errors[fieldName]);
                                    }
                                });
                            }
                        });
                    })}>
                        <FormField
                            name="file"
                            control={form.control}
                            render={({ field: { value, onChange, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Select a file</FormLabel>

                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="file"
                                            value={value?.fileName}
                                            onChange={(evt) => {
                                                if (!evt.target.files) return;
                                                onChange(evt.target.files[0]);
                                            }} />
                                    </FormControl>

                                    <FormDescription>File must be in CSV format</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <Button type="submit" className="mt-8 ml-auto">Upload</Button>
                    </form>
                </Form>
            </DialogHeader>
        </DialogContent>
    </Dialog>
}
