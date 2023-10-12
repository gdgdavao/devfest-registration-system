import { handleFormServerSideError, useImportCsvMutation, useInitialImportCsvMutation } from "@/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Collections } from "@/pocketbase-types";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

export default function ImportCsvDialog({ children }: { children: ReactNode }) {
    const [open, setIsOpen] = useState(false);
    const [importState, setImportState] = useState<'uploading' | 'mapping' | 'importing'>('uploading');
    const { data: initialImportData, mutate: initialImportCsv } = useInitialImportCsvMutation();
    const { mutate: importCsv } = useImportCsvMutation();
    const mappingForm = useForm();
    const initialImportForm = useForm();

    return <Dialog open={open} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className={cn([importState === 'mapping' ? 'lg:max-w-screen-lg': 'lg:max-w-screen-sm'], 'overflow-y-scroll max-h-[calc(100vh-2rem)]')}>
            <DialogHeader>
                <DialogTitle>Import CSV</DialogTitle>

                {importState === 'uploading' && <Form {...initialImportForm}>
                    <form className="flex flex-col space-y-2" onSubmit={initialImportForm.handleSubmit((data) => {
                        initialImportCsv(data.file, {
                            onError(err) {
                                handleFormServerSideError(err, (errors) => {
                                    for (const fieldName in errors) {
                                        initialImportForm.setError(fieldName as never, errors[fieldName]);
                                    }
                                });
                            },
                            onSuccess() {
                                setImportState('mapping');
                            },
                        });
                    })}>
                        <FormField
                            name="file"
                            control={initialImportForm.control}
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
                </Form>}

                {importState === 'mapping' && (
                    <Form {...mappingForm}>
                        <form onSubmit={mappingForm.handleSubmit((values) => {
                            importCsv(values as never);
                        })}>
                            <FormField
                                name="import_id"
                                control={mappingForm.control}
                                defaultValue={initialImportData?.id}
                                render={({ field }) => (
                                    <input type="hidden" {...field} />
                                )} />

                            <FormField
                                name="collection"
                                control={mappingForm.control}
                                defaultValue={Collections.Registrations}
                                render={({ field }) => (
                                    <input type="hidden" {...field} />
                                )} />

                            <FormField
                                name="mappings"
                                control={mappingForm.control}
                                defaultValue={initialImportData?.id}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Map the following fields</FormLabel>

                                        <div className="flex flex-col space-y-2">
                                            {(initialImportData?.columns ?? []).map(col => (
                                                <div key={`col_${col}`} className="flex flex-row justify-between">
                                                    <p className="w-1/2">{col}</p>

                                                    <FormField
                                                        name={`${field.name}.${col}`}
                                                        control={mappingForm.control}
                                                        render={({ field: sfield }) => (
                                                            <FormItem className="w-1/2">
                                                                <FormControl>
                                                                    <Select
                                                                        name={sfield.name}
                                                                        onValueChange={sfield.onChange} defaultValue={sfield.value}>
                                                                        <SelectTrigger>
                                                                            <SelectValue>--select--</SelectValue>
                                                                        </SelectTrigger>

                                                                        <SelectContent>
                                                                            <SelectItem value="select">--select--</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormControl>
                                                            </FormItem>
                                                        )} />
                                                </div>
                                            ))}
                                        </div>
                                    </FormItem>
                                )} />

                            <Button type="submit" className="mt-8 ml-auto">Upload</Button>
                        </form>
                    </Form>
                )}
            </DialogHeader>
        </DialogContent>
    </Dialog>
}
