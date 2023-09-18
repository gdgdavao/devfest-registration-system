import { pb } from "@/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { mutate: login } = useMutation(({ email, password } :  { email: string, password: string }) => {
        return pb.admins.authWithPassword(email, password);
    })

    // TODO: add loading
    return (
        <div className="max-w-md mx-auto px-2 pt-24">
            <form onSubmit={(ev) => {
                ev.preventDefault();
                const fd = new FormData(ev.currentTarget);
                login({
                    email: fd.get('email')!.toString(),
                    password: fd.get('password')!.toString()
                }, {
                    onSuccess() {
                        navigate('/admin')
                    }
                });
            }}>
                <Card>
                    <CardHeader>
                        <CardTitle>DRS Login</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                        <div className="space-y-1">
                            <Label htmlFor="email">E-mail address</Label>
                            <Input type="email" name="email" id="email" placeholder="example@example.com" />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <Input type="password" name="password" id="password" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit">Login</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
