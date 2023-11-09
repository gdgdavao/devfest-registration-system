import { mutationConfig, pb } from "@/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { joiResolver } from "@hookform/resolvers/joi";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQuery } from "@tanstack/react-query";
import Joi from "joi";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import DataFilter from "@/components/data-filter/DataFilter";
import { DataFilterValue } from "@/components/data-filter/types";
import * as pbf from "@nedpals/pbf";

export default function SendMailDialog({ filter = [], recipients: defaultRecipients = [], template, children }: { 
    filter?: DataFilterValue[]
    recipients?: string[]
    template: string
    children: ReactNode 
}) {
    const [isOpen, setIsOpen] = useState(false);

    const { data: emailTemplates, isLoading } = useQuery(['email_templates'], () => {
        return pb.send<{ name: string, id: string }[]>('/api/email_templates', { method: 'GET' });
    }, {
        staleTime: 10 * (60 * 1000)
    });

    const form = useForm({
        resolver: joiResolver(Joi.object({
            filterType: Joi.string(),
            filter: Joi.array().when('filterType', {
                    is: 'filter',
                    then: Joi.required(),
                    otherwise: Joi.forbidden()
                }),
            recipients: Joi.array().items(Joi.string().email({ tlds: false }))
                .when('filterType', {
                    is: 'email',
                    then: Joi.required(),
                    otherwise: Joi.forbidden()
                }),
            template: Joi.string().required(),
            force: Joi.bool()
        })),
        defaultValues: {
            filterType: 'filter',
            filter: [] as DataFilterValue[],
            recipients: [] as string[],
            template: "confirm",
            force: false
        }
    });

    const currentTemplate = form.watch("template");
    const currentFilter = form.watch("filter", []);
    const currentFilterType = form.watch("filterType");
    const currentRecipients = form.watch("recipients", []);

    const finalFilter = useMemo(() => {
        if (currentFilterType === 'email' && currentRecipients.length > 0) {
            if (currentRecipients.length === 1) {
                return pbf.eq('email', currentRecipients[0]);
            }
            return pbf.eq.either('email', currentRecipients);
        } else if (currentFilter.length === 1) {
            return currentFilter[0];
        }
        return pbf.and(...currentFilter);
    }, [currentFilter, currentFilterType, currentRecipients]);

    const { mutate: sendMail, isLoading: isEmailSending } = useMutation(({ filter, ...payload }: { filter: pbf.Filter, template: string, force: boolean }) => {
        return pb.send<{ message: string }>('/api/admin/send_emails', {
            method: "POST",
            body: {
                ...payload,
                filter: pbf.stringify(filter),
            }
        });
    }, mutationConfig);

    useEffect(() => {
        if (!currentTemplate && emailTemplates) {
            form.resetField('template', { defaultValue: emailTemplates[0].id });
        }
    }, [currentTemplate, emailTemplates]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        form.reset({
            template,
            filterType: defaultRecipients.length !== 0 ? "email" : "filter",
            recipients: defaultRecipients ?? [],
            filter: filter ?? [],
        }, {
            keepTouched: true
        });
    }, [isOpen]);

    return (
        <Dialog open={isOpen && !!emailTemplates} onOpenChange={(state) => {
            setIsOpen(state);
            setTimeout(() => (document.body.style.pointerEvents = ""), 100);
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(({ template, force }) => {
                        sendMail({
                            template,
                            force,
                            filter: finalFilter,
                        }, {
                            onSuccess(data) {
                                toast.success(data.message);
                                setIsOpen(false);
                            }
                        });
                    })}>
                        <DialogHeader>
                            <DialogTitle>Send e-mail</DialogTitle>
                            <FormField
                                control={form.control}
                                name="template"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select template</FormLabel>
                                        <FormControl>
                                            <Select
                                                name={field.name}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={field.disabled || isLoading}>
                                                <SelectTrigger className="[&>*:first-child]:capitalize">
                                                    <SelectValue
                                                        placeholder={
                                                            emailTemplates?.find(t => t.id === field.value)?.name ?? 'Unknown template'
                                                        } />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {!emailTemplates ? (
                                                        <SelectItem value="">Loading...</SelectItem>
                                                    ) : emailTemplates?.map(template => (
                                                        <SelectItem
                                                            key={`email_template_${template.id}`}
                                                            value={template.id}>
                                                            {template.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )} />

                            <FormField
                                control={form.control}
                                name="filterType"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1">
                                                <FormItem className="flex items-start space-x-3">
                                                    <FormControl className="mt-2">
                                                        <RadioGroupItem value="filter" />
                                                    </FormControl>
                                                    <div className="flex flex-col space-y-2 w-full">
                                                        <FormLabel>Send by filter</FormLabel>

                                                        <FormField
                                                            control={form.control}
                                                            name="filter"
                                                            disabled={form.getValues('filterType') !== 'filter'}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <DataFilter
                                                                            collection="registrations"
                                                                            onChange={field.onChange}
                                                                            value={field.value} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                                    </div>
                                                </FormItem>
                                                <FormItem className="flex items-start space-x-2 w-full">
                                                    <FormControl className="mt-2">
                                                        <RadioGroupItem value="email" />
                                                    </FormControl>
                                                    <div className="flex flex-col space-y-2 w-full">
                                                        <FormLabel>Send to specific e-mail addresses</FormLabel>

                                                        <FormField
                                                            control={form.control}
                                                            name="recipients"
                                                            disabled={currentFilterType !== 'email'}
                                                            render={({ field: { onChange, ...field } }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Input
                                                                            {...field}
                                                                            type="text"
                                                                            placeholder="example@example.com"
                                                                            value={(field.value ?? []).join(',')}
                                                                            onChange={(evt) => {
                                                                                onChange(
                                                                                    evt.target.value.split(',').map(i => i.trim())
                                                                                );
                                                                            }} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                                    </div>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )} />
                        </DialogHeader>
                        <DialogFooter className="pt-4">
                            <Button
                                disabled={isEmailSending}
                                type="submit"
                                onClick={() => form.trigger()}>
                                {isEmailSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEmailSending ? 'Sending' : 'Send'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
