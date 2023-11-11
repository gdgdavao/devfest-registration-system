import { useParticipantsSearchQuery } from "@/client";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderIcon } from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import * as pbf from "@nedpals/pbf";
import { Badge } from "@/components/ui/badge";
import { CommandLoading } from "cmdk";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";

function ParticipantsListAutocomplete({ filter, onSelect, children }: {
    filter: pbf.Filter | null
    onSelect: (v: string) => void
    children: ReactNode
}) {
    const { data: results, isLoading } = useParticipantsSearchQuery(filter);
    const [openSuggestions, setOpenSuggestions] = useState(false);

    useEffect(() => {
        if (filter !== null) {
            setOpenSuggestions(true);
        }
    }, [filter]);

    return (
        <Popover open={openSuggestions && filter !== null} onOpenChange={() => {}}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>

            <PopoverContent align="center" className="max-w-2xl w-[1000px] mx-4 md:mx-0 p-0" onOpenAutoFocus={(evt) => { evt.preventDefault(); }}>
                <Command>
                    <CommandList>
                        {isLoading ? (
                            <CommandLoading>
                                <div className="w-full flex py-8 justify-center">
                                    <LoaderIcon className="text-gray-500 animate-spin" />
                                </div>
                            </CommandLoading>
                        ) : (
                            <CommandEmpty>No results found.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {results?.map(r => (
                                <CommandItem
                                    key={r.pId}
                                    value={r.pId}
                                    onSelect={(selectedId) => {
                                        onSelect(selectedId);
                                        setOpenSuggestions(false);
                                    }}>
                                    <div className="w-full flex items-center justify-between text-xl">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold inline-block">
                                                {r.expand!.registrant.last_name}, {r.expand!.registrant.first_name}
                                            </span>
                                            <Badge>{r.expand!.registrant.type}</Badge>
                                        </div>
                                        <span className="font-mono">{r.pId}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default function CheckinHeader({ value: selectedParticipantId, onChange: setSelectedParticipantId }: {
    value: string
    onChange: (s: string) => void
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const setSearchMode = (mode: string) => setSearchParams(sp => { sp.set('mode', mode); return sp; })
    const searchMode = useMemo(() => searchParams.get('mode') ?? 'id', [searchParams]);
    const [participantIdType, setParticipantIdType] = useState('');
    const [participantId, setParticipantId] = useState('');
    const [participantName, setParticipantName] = useState('');

    const _filter = useMemo(() => {
        if (searchMode === 'name' && participantName.length > 0) {
            return pbf.or(
                pbf.like('registrant.first_name', participantName),
                pbf.like('registrant.last_name', participantName),
            );
        } else if (searchMode === 'id' && participantId.length > 0 && participantIdType.length > 0) {
            return pbf.like('pId', `${participantIdType.toUpperCase()}-%${participantId}%`,);
        }
        return null;
    }, [searchMode, participantId, participantIdType, participantName]);

    const [filter] = useDebounce(_filter, 500);
    const pIdTextBox = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (participantIdType.length !== 0) {
            pIdTextBox.current?.focus();
        }
    }, [participantIdType]);

    return (
        <Tabs value={searchMode} onValueChange={(v) => {
            setSearchMode(v);
            setSelectedParticipantId('');
        }} className="w-full pb-8">
            <TabsList className="grid w-1/2 grid-cols-2 mx-auto">
                <TabsTrigger value="id">Participant ID</TabsTrigger>
                <TabsTrigger value="name">Name</TabsTrigger>
            </TabsList>
            <TabsContent value="id" className="flex flex-col items-stretch w-full space-y-4">
                <div className="flex space-x-2 justify-center pt-8">
                    <Button
                        onClick={() => setParticipantIdType('tensor')}
                        className="flex-1 text-2xl py-8 px-12">Tensor</Button>
                    <Button
                        onClick={() => setParticipantIdType('vertex')}
                        className="flex-1 text-2xl py-8 px-12" variant="destructive">Vertex</Button>
                    <Button
                        onClick={() => setParticipantIdType('jetpack')}
                        className="flex-1 text-2xl py-8 px-12" variant="success">Jetpack</Button>
                </div>

                <ParticipantsListAutocomplete
                    filter={filter}
                    onSelect={(v) => {
                        setSelectedParticipantId(v);
                        setParticipantId(v.split('-')[1]);
                    }}>
                    <Input
                        type="text"
                        role="combobox"
                        inputMode="numeric"
                        pattern="[0-9]{3}"
                        placeholder="Enter 3-digit number"
                        minLength={3}
                        maxLength={3}
                        value={participantId}
                        ref={pIdTextBox}
                        disabled={searchMode !== 'id'}
                        onChange={(evt) => setParticipantId(evt.currentTarget.value)}
                        onKeyDown={(evt) => {
                            if (evt.key === 'Backspace' && selectedParticipantId.length > 3 && selectedParticipantId.endsWith("-" + evt.currentTarget.value)) {
                                setParticipantId('');
                                setSelectedParticipantId('');
                            }
                        }}
                        className="text-center text-2xl px-10 py-8" />
                </ParticipantsListAutocomplete>
            </TabsContent>
            <TabsContent value="name" className="w-full">
                <ParticipantsListAutocomplete
                    filter={filter}
                    onSelect={setSelectedParticipantId}>
                    <Input
                        type="text"
                        placeholder="Search by first name or last name"
                        className="text-2xl px-10 py-8"
                        value={participantName}
                        disabled={searchMode !== 'name'}
                        onChange={(evt) => setParticipantName(evt.currentTarget.value)} />
                </ParticipantsListAutocomplete>
            </TabsContent>
        </Tabs>
    );
}
