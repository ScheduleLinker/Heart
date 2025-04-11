class IcsInstructorCourseNamesList:
  def __init__(self):
    self.instructor_list= []
    self.course_list = []

  def add_instructor_name(self, instructor_name):
    self.instructor_list.append(instructor_name)

  def add_course_name(self, course_name):
    self.course_list.append(course_name)

  def get_all(self):

    #if both lists and not the same length return an error
    if len(self.instructor_list) != len(self.course_list):
      raise ValueError("Instructor and course lists must be the same length")

    joined_list = []
    for instructor, course in zip(self.instructor_list, self.course_list):
      joined_list.append(f"{instructor}-{course}")
    return joined_list
  
  def reset(self):
    self.instructor_list.clear()
    self.course_list.clear()