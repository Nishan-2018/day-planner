-- Update tasks table to use start_date and end_date instead of due_date
ALTER TABLE tasks RENAME COLUMN due_date TO end_date;
ALTER TABLE tasks ADD COLUMN start_date DATE;

-- Update the existing data to have start_date same as end_date
UPDATE tasks SET start_date = end_date WHERE start_date IS NULL;

-- Create task_comments table for daily progress
CREATE TABLE task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for task_comments
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own comments"
  ON task_comments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comments"
  ON task_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON task_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON task_comments FOR DELETE
  USING (auth.uid() = user_id);
