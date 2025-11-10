"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2, Edit, Users, Undo, Redo } from 'lucide-react';
import { useNetwork } from '@/contexts/NetworkContext';
import UserFormDialog from './UserFormDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const DEFAULT_HOBBIES = [
  'Reading',
  'Gaming',
  'Cooking',
  'Photography',
  'Hiking',
  'Music',
  'Dancing',
  'Painting',
  'Coding',
  'Yoga',
  'Traveling',
  'Gardening',
  'Swimming',
  'Running',
  'Cycling',
  'Fishing',
  'Writing',
  'Drawing',
  'Singing',
  'Playing Guitar',
  'Playing Piano',
  'Meditation',
  'Knitting',
  'Sewing',
  'Pottery',
  'Sculpting',
  'Baking',
  'Wine Tasting',
  'Coffee Brewing',
  'Bird Watching',
  'Astronomy',
  'Chess',
  'Board Games',
  'Video Editing',
  'Podcasting',
  'Blogging',
  'Vlogging',
  'Skateboarding',
  'Surfing',
  'Rock Climbing',
  'Martial Arts',
  'Boxing',
  'Weightlifting',
  'Crossfit',
  'Pilates',
  'Zumba',
  'Salsa Dancing',
  'Ballet',
  'Theater',
  'Acting',
  'Stand-up Comedy',
  'Magic Tricks',
  'Juggling',
  'Origami',
  'Calligraphy',
  'Scrapbooking',
  'Woodworking',
  'Metalworking',
  'Car Restoration',
  'Motorcycle Riding',
  'Camping',
  'Backpacking',
  'Mountain Biking',
  'Kayaking',
  'Canoeing',
  'Sailing',
  'Scuba Diving',
  'Snorkeling',
  'Skiing',
  'Snowboarding',
  'Ice Skating',
  'Roller Skating',
  'Archery',
  'Shooting',
  'Hunting',
  'Foraging',
  'Beekeeping',
  'Homebrewing',
  'Wine Making',
  'Cheese Making',
  'Soap Making',
  'Candle Making',
  'Jewelry Making',
  'Leather Crafting',
  'Embroidery',
  'Quilting',
  'Crocheting',
  'Macrame',
  'Basket Weaving',
  'Glass Blowing',
  'Blacksmithing',
  '3D Printing',
  'Robotics',
  'Electronics',
  'Ham Radio',
  'Model Building',
  'RC Cars',
  'Drones',
  'Collecting Coins',
  'Collecting Stamps',
  'Collecting Comics',
  'Collecting Vinyl',
  'DJing',
  'Music Production',
  'Beatboxing',
];

export default function Sidebar() {
  const { users, selectedUser, setSelectedUser, deleteUser, updateUser, unlinkUsers, undo, redo, canUndo, canRedo } = useNetwork();
  const [hobbySearch, setHobbySearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(hobbySearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [hobbySearch]);

  const filteredHobbies = DEFAULT_HOBBIES.filter(hobby =>
    hobby.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, hobby: string) => {
    e.dataTransfer.setData('hobby', hobby);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleHobbyClick = async (hobby: string) => {
    if (!selectedUser) return;
    
    const hobbies = selectedUser.hobbies.includes(hobby)
      ? selectedUser.hobbies.filter(h => h !== hobby)
      : [...selectedUser.hobbies, hobby];
    
    await updateUser(selectedUser.id, selectedUser.username, selectedUser.age, hobbies);
  };

  const handleEdit = () => {
    setEditMode(true);
    setUserFormOpen(true);
  };

  const handleDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-slate-900 border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Network Control
          </h2>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="outline"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 h-full">
        <div className="p-4 space-y-6">
          {/* User Management Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Users ({users.length})</h3>
              <Button
                size="sm"
                onClick={() => {
                  setEditMode(false);
                  setUserFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add User
              </Button>
            </div>

            {selectedUser ? (
              <Card className="p-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{selectedUser.username}</h4>
                    <p className="text-xs text-muted-foreground">
                      Age: {selectedUser.age} | Score: {selectedUser.popularityScore}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Friends: {selectedUser.friends.length}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium mb-2">Hobbies:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedUser.hobbies.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">
                        No hobbies assigned
                      </span>
                    ) : (
                      selectedUser.hobbies.map((hobby, idx) => (
                        <Badge key={idx} variant="default">
                          {hobby}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                {selectedUser.friends.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2">Friends:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedUser.friends.map((friendId) => {
                        const friend = users.find(u => u.id === friendId);
                        if (!friend) return null;
                        return (
                          <div key={friendId} className="flex items-center justify-between text-xs bg-muted/50 px-2 py-1 rounded">
                            <span>{friend.username}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5"
                              onClick={async () => {
                                await unlinkUsers(selectedUser.id, friendId);
                              }}
                              title="Disconnect"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedUser(null)}
                >
                  Deselect
                </Button>
              </Card>
            ) : (
              <Card className="p-3">
                <p className="text-sm text-muted-foreground text-center">
                  Select a user node to view details
                </p>
              </Card>
            )}
          </div>

          <Separator />

          {/* Hobbies Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Hobbies Library</h3>
            <p className="text-xs text-muted-foreground">
              {selectedUser
                ? 'Click to toggle or drag to any user node'
                : 'Drag hobbies to user nodes to assign'}
            </p>

            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hobbies..."
                value={hobbySearch}
                onChange={(e) => setHobbySearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredHobbies.map((hobby) => {
                const isAssigned = selectedUser?.hobbies.includes(hobby);
                return (
                  <Badge
                    key={hobby}
                    variant={isAssigned ? 'default' : 'outline'}
                    className="cursor-move transition-all hover:scale-105"
                    draggable
                    onDragStart={(e) => handleDragStart(e, hobby)}
                    onClick={() => selectedUser && handleHobbyClick(hobby)}
                  >
                    {hobby}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      <UserFormDialog
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        editMode={editMode}
        user={editMode ? selectedUser : undefined}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        userName={selectedUser?.username}
      />
    </div>
  );
}