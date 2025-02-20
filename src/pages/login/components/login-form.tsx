import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription className="tracking-wide">
            Ingresa tus datos para acceder a la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="usuario" className="tracking-wide">
                  Usuario
                </Label>
                <Input
                  id="usuario"
                  placeholder="Ingresar usuario"
                  className="tracking-wide"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="tracking-wide">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Perdiste tu contraseña?
                  </a>
                </div>
                <Input
                  className="tracking-wide"
                  id="password"
                  type="password"
                  placeholder="Password"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="dark"
                size="smallWeb"
                className="w-full"
              >
                Login
              </Button>
              <Button
                variant="neutral"
                className="w-full text-primary-500 border-none"
                size="smallWeb"
              >
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
