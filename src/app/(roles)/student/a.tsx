<Card
                      key={project.id}
                      onClick={() => toggleProjectSelection(project)}
                      className={`flex justify-between cursor-pointer p-4 w-full border ${
                        selected ? "border-blue-500 bg-blue-100" : ""
                      }`}
                    >
                      <div className="col-8">
                        <h3 className="text-lg font-medium">{project.title}</h3>
                        <p className="text-sm text-gray-500">
                          Supervisor: {project.professor}
                        </p>
                        <p className="text-sm text-gray-500">
                          Co-Supervisor: {project.cosupervisor}
                        </p>
                        <p className="text-sm text-gray-500">
                          {project.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Capacity: {project.capacity}
                        </p>
                      </div>
                      <div className="col-4">
                        {selected && (
                          <div className="mt-2">
                            <input
                              type="text"
                              placeholder="Enter group member roll number(s)"
                              value={selected.groupInfo}
                              onChange={(e) =>
                                updateGroupInfo(project.id, e.target.value)
                              }
                              className="w-full p-2 border rounded-md"
                            />
                            <Button
                              onClick={() =>
                                updateGroupInfo(project.id, "No Group Member")
                              }
                            >
                              No Group Member
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>


const updateGroupInfo = (projectId: string, value: string) => {
    setSelectedProjects((prev) =>
      prev.map((p) =>
        p.project.id === projectId ? { ...p, groupInfo: value } : p
      )
    );
  };