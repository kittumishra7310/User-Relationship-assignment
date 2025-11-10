"use client"

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNetwork, User } from '@/contexts/NetworkContext';
import { Loader2 } from 'lucide-react';

const userFormSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username is too long'),
  age: z.coerce.number().min(1, 'Age must be at least 1').max(150, 'Age must be less than 150'),
  hobbies: z.string(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode?: boolean;
  user?: User | null;
}

export default function UserFormDialog({
  open,
  onOpenChange,
  editMode = false,
  user,
}: UserFormDialogProps) {
  const { createUser, updateUser } = useNetwork();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      age: 18,
      hobbies: '',
    },
  });

  useEffect(() => {
    if (open && editMode && user) {
      form.reset({
        username: user.username,
        age: user.age,
        hobbies: user.hobbies.join(', '),
      });
    } else if (open && !editMode) {
      form.reset({
        username: '',
        age: 18,
        hobbies: '',
      });
    }
  }, [open, editMode, user, form]);

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      const hobbies = values.hobbies
        .split(',')
        .map(h => h.trim())
        .filter(h => h.length > 0);

      if (editMode && user) {
        await updateUser(user.id, values.username, values.age, hobbies);
      } else {
        await createUser(values.username, values.age, hobbies);
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {editMode
              ? 'Update user information and hobbies'
              : 'Add a new user to the network'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter age" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hobbies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hobbies (comma-separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Reading, Gaming, Cooking"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editMode ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}